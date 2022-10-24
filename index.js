import { gql, ApolloServer, UserInputError, AuthenticationError } from "apollo-server"
import './db.js'
import Person from "./models/person.js";
import User from './models/user.js'
import jst from 'jsonwebtoken'

const JWT_SECRET = 'JAKAS_NAZWA_TOKENU_DLA_BEZPIECZENSTWA'

const typeDefs = gql`
enum YESNO{
    YES
    NO
}
type Address {
    street: String!
    city: String!
}
type Person {
    name: String!
    phone: String
    address:Address!
    check: String!
    id:ID!
}
type User {
username:String!
friends:[Person]!
id: ID!
}
type Token {
    value: String!
}
type Query{
    personCount: Int!
    allPersons(phone: YESNO): [Person]!
    findPerson(name: String!): Person
    me: User
}
type Mutation{
    addPerson(
        name:String!
        phone:String
        street:String!
        city:String!
    ):Person
    editNumber(
        name:String!
        phone:String!
    ): Person
    createUser(
        username: String!
    ): User
    login(
        username: String!
        password: String!
    ): Token
}

`

const resolvers = {
    Query: {
        personCount: () => Person.collection.countDocuments(),
        allPersons: async (root, args) => {
            if (!args.phone) {
                return Person.find({})
            }
            return Person.find({ phone: { $exists: args.phone === 'YES' } })
        },
        findPerson: async (root, args) => {
            const { name } = args
            return await Person.findOne({ name })
        },
        me: (root, args, context) => {
            return context.currentUser
        }
    },
    Mutation: {
        addPerson: async (root, args, context) => {
            const { currentUser } = context
            if (!currentUser) throw new AuthenticationError('not authenticated')
            const person = new Person({ ...args })
            try {
                await person.save()
                currentUser.friends = currentUser.friends.concat(person)
                await currentUser.save()
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            }
            return
        },
        editNumber: async (root, args) => {
            const person = Person.findOne({ name: args.name })
            if (!person) return

            person.phone = args.phone
            try {
                await person.save()
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            }
            return person

        },
        createUser: (root, args) => {
            const user = new User({ username: args.username })

            return user.save().catch(error => {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })
            if (!user || args.password !== 'secret') {
                throw new UserInputError('Wrong Credentials')
            }
            const userForToken = {
                username: user.username,
                id: user._id
            }
            return {
                value: jst.sign(userForToken, JWT_SECRET)
            }
        }
    },
    Person: {
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        },
        check: () => "mid"
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const token = auth.substring(7)
            const { id } = jst.verify(token, JWT_SECRET)
            const currentUser = await User.findById(id).populate('friends')
            return { currentUser }
        }
    }
});

server.listen().then(({ url }) => {
    console.log(`Server reade at ${url}`)
})