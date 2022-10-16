import { gql, ApolloServer, UserInputError } from "apollo-server"
import { v1 as uuid } from "uuid";
import axios from "axios";

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
        personCount: () => persons.length,
        allPersons: async (root, args) => {
            const { data: personsFromAPI } = await axios.get('http://localhost:3000/persons')
            if (!args.phone) return personsFromAPI
            const byPhone = person =>
                args.phone === "YES" ? person.phone : !person.phone
            return personsFromAPI.filter(byPhone)
        },
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
        },
        editNumber: (root, args) => {
            const personIndex = persons.findIndex(p => p.name == args.name)
            if (personIndex === -1) return null
            const person = persons[personIndex]
            const updatedPerson = { ...person, phone: args.phone }
            persons[personIndex] = updatedPerson
            return updatedPerson
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