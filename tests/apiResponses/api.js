import axios from 'axios'

const BASE_URL = 'http://localhost:8080'
const API_URL = '/api'
const APOLLO_URL = `/graphql`
let accessToken

const instanceAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 1000,
})

export const signIn = async (variables) => {
  const response = await instanceAxios
    .post(`${API_URL}/login`, variables)
    .catch((e) => {
      return e
    })

  return response
}

export const me = async (headersConfig) => {
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
        {
          me {
            id
            email
            firstName
            lastName
          }
        }
      `,
      },
      headersConfig,
    )
    .catch((e) => {
      return e
    })

  return result
}

export const user = async (variables, headersConfig) => {
  return instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
      query ($id: ID!) {
        user(id: $id) {
          id
          email
          userType
        }
      }
    `,
        variables,
      },
      headersConfig,
    )
    .catch((error) => {
      return error
    })
}

export let users = async (headersConfig) => {
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
      {
        users {
          id
          email
          firstName
          lastName
          userType
        }
      }
    `,
      },
      headersConfig,
    )
    .catch((error) => {
      return error
    })

  return result
}

export const signUp = async (variables, headersConfig) => {
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `mutation(
        $email: String!
        $firstName: String!
        $lastName: String!
        $password: String!
        $userType: String!
      ) {
        signUp(
          email: $email,
          firstName: $firstName
          lastName: $lastName
          password: $password
          userType: $userType
        ) {
          accessToken
        }
      }
    `,
        variables,
      },
      headersConfig,
    )
    .catch((error) => {
      return error
    })

  return result
}

export const updateUser = async (variables, headersConfig) => {
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
        mutation (
          $id: String!
          $email: String!
          $firstName: String
          $lastName: String
          $userType: String!) {
          updateUser(
            id: $id
            email: $email
            firstName: $firstName
            lastName: $lastName
            userType: $userType ) {
            id  
            email
            firstName
            lastName
            userType
          }
        }
      `,
        variables,
      },
      headersConfig,
    )
    .catch((e) => {
      return e
    })

  return result
}

export const deleteUser = async (variables, headersConfig) => {
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
        mutation ($id: ID!) {
          deleteUser(id: $id)
        }
      `,
        variables,
      },
      headersConfig,
    )
    .catch((e) => {
      return e
    })

  return result
}

export const products = async (variables, headersConfig) => {
  //console.log(variables)
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
        query (
          $filter: Filter
          ) {
            products(filter: $filter) {
              userId
              productId
              title,
              description,
              createdAt
            }
        }
      `,
        variables,
      },
      headersConfig,
    )
    .catch((e) => {
      return e
    })

  return result
}

export const product = async (variables, headersConfig) => {
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
        query (
          $id: ID!
          ) {
            product(id: $id) {
              userId
              productId
              title,
              description,
              createdAt
            }
        }
      `,
        variables,
      },
      headersConfig,
    )
    .catch((e) => {
      return e
    })

  return result
}

export const userProduct = async (variables, headersConfig) => {
  const result = axios
    .post(
      'http://localhost:8080' + APOLLO_URL,
      {
        query: `
      query (
        $id: ID!
        ) {
          allUserProducts(id: $id) {
            userId
            productId
            title,
            description,
            createdAt
          }
      }
    `,
        variables,
      },
      headersConfig,
    )
    .catch((e) => {
      return e
    })

  return result
}

export const createProduct = async (variables, headersConfig) => {
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
        mutation (
          $userId: ID!
          $title: String!
          $description: String
          $price: Int!
          $imagesUrl: [String]
          ) {
          createProduct(
            userId: $userId
            title: $title
            description: $description
            price: $price
            imagesUrl: $imagesUrl
            ) {
              title
              description
              price,
              productId,
              userId
            }
        }
      `,
        variables,
      },
      headersConfig,
    )
    .catch((e) => {
      //console.log(e.response.data)
      return e
    })

  return result
}

export const deleteProduct = async (variables, headersConfig) => {
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
        mutation (
          $id: ID!
          ) {
            deleteProduct(id: $id)
          }
      `,
        variables,
      },
      headersConfig,
    )
    .catch((e) => {
      return e
    })

  return result
}

export const editProduct = async (variables, headersConfig) => {
  const result = instanceAxios
    .post(
      APOLLO_URL,
      {
        query: `
        mutation (
          $id: ID!
          $userId: ID!
          $title: String!
          $description: String
          $price: Int!
          $imagesUrl: [String]
          ) {
          editProduct(
            id: $id
            userId: $userId
            title: $title
            description: $description
            price: $price
            imagesUrl: $imagesUrl
            ) {
              title
              description
              price,
              productId,
              userId, 
              imagesUrl
            }
        }
      `,
        variables,
      },
      headersConfig,
    )
    .catch((e) => {
      return e
    })

  return result
}
