import { gql, ApolloServer, UserInputError } from "apollo-server"
import { v1 as uuid } from "uuid";
const persons = [
    {
        name: "Tadeo",
        phone: "+48666222666",
        street: "Frontend",
        city: "Madrid",
        id: "65646565656"
    },
    {
        name: "Aleks",
        phone: "+48666632666",
        street: "Backend",
        city: "Warszawa",
        id: "65646565657"
    },
    {
        name: "Karol",
        phone: "+48986222666",
        street: "API",
        city: "Mielec",
        id: "65646565658"
    },
    {
        name: "Józef",
        phone: "+48986222666",
        street: "GraphQL",
        city: "Galilea",
        id: "65646565659"
    },
]

const typeDefs = gql`
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
    allPersons: [Person]!
    findPerson(name: String!): Person
}
type Mutation{
    addPerson(
        name:String!
        phone:String
        street:String!
        city:String!
    ):Person

}

`

const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: () => persons,
        findPerson: (root, args) => {
            const { name } = args
            return persons.find(person => person.name === name)
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            if (persons.find(p => p.name === args.name)) {
                throw new UserInputError('Name must be unique', {
                    invalidArgs: args.name
                })
            }
            const person = { ...args, id: uuid() }
            persons.push(person)
            return person
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
    resolvers
});

server.listen().then(({ url }) => {
    console.log(`Server reade at ${url}`)
})