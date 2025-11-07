import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client";

// ---- 1. EL CLIENTE: La conexión directa a tu API de AWS AppSync ----
export const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_APPSYNC_URL, // Usa la URL de tu .env.local
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_APPSYNC_API_KEY || "", // Usa la clave de tu .env.local
    },
  }),
  cache: new InMemoryCache(),
});

// ---- 2. EL CONTRATO (TYPESCRIPT): Le decimos a nuestro frontend cómo es una Tarea ----
export interface Task {
  id: string;
  name: string;
  completed: boolean;
}

// ---- 3. LAS INSTRUCCIONES (GRAPHQL): Las operaciones que podemos hacer ----
// Instrucción para LEER la lista de tareas
export const LIST_TASKS_QUERY = gql`
  query ListTasks {
    listTasks {
      id
      name
      completed
    }
  }
`;

// Instrucción para CREAR una nueva tarea
export const ADD_TASK_MUTATION = gql`
  mutation AddTask($name: String!) {
    addTask(name: $name) {
      id
      name
      completed
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $name: String!, $completed: Boolean!) {
    updateTask(id: $id, name: $name, completed: $completed) {
      id
      name
      completed
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id # Pedimos que nos devuelva el id de la tarea borrada
    }
  }
`;
