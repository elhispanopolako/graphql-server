import { gql, ApolloServer, UserInputError } from "apollo-server"
import './db.js'
import Person from "./models/person.js";

const typeDefs = gql`
enum YESNO{
    YES
    NO
}
type Address {
    street: String!
    city: String!
}
type Person{
    name: String!
    phone: String
    address:Address!
    check: String!
    id:ID!
}

type Query{
    personCount: Int!
    allPersons(phone: YESNO): [Person]!
    findPerson(name: String!): Person
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
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            const person = new Person({ ...args })
            return person.save()
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
    resolvers
});

server.listen().then(({ url }) => {
    console.log(`Server reade at ${url}`)
})