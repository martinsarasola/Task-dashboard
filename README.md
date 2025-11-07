# Mi Lista de Tareas - Proyecto Full-Stack

Esta es una aplicación web completa de lista de tareas (To-Do list) diseñada para demostrar una arquitectura moderna de desarrollo web. El proyecto integra un frontend reactivo construido con **Next.js** y **Tailwind CSS** con un potente backend basado en **GraphQL** y alojado en **AWS**.

## Características Principales

*   **Gestión de Tareas:** Permite a los usuarios añadir, ver y marcar tareas como completadas.
*   **Interfaz Reactiva:** Construida con **React** y **Next.js** para una experiencia de usuario rápida y dinámica.
*   **Comunicación con GraphQL:** Utiliza **Apollo Client** para gestionar el estado de los datos y comunicarse de manera eficiente con el servidor GraphQL.
*   **UI Optimista (Optimistic UI):** Al marcar una tarea como completada, la interfaz se actualiza instantáneamente, incluso antes de recibir la confirmación del servidor, lo que proporciona una sensación de inmediatez.
*   **Backend Escalable:** El backend está implementado con servicios de **AWS**, lo que garantiza una base sólida y escalable para la aplicación.
*   **Diseño Moderno:** La interfaz está estilizada con **Tailwind CSS** y utiliza componentes de `shadcn/ui` para un diseño limpio y moderno.

## Tecnologías Utilizadas

*   **Frontend:**
    *   Next.js 16
    *   React
    *   TypeScript
    *   Apollo Client
    *   Tailwind CSS
    *   shadcn/ui

*   **Backend:**
    *   GraphQL
    *   AWS (AppSync, DynamoDB, Lambda)

## ¿Cómo Empezar?

Para ejecutar este proyecto de forma local, sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/martinsarasola/Task-dashboard
    ```

2.  **Navega al directorio del proyecto:**
    ```bash
    cd task-dashboard
    ```

3.  **Instala las dependencias:**
    ```bash
    npm install
    ```

4.  **Configura las variables de entorno:**
    Crea un archivo `.env.local` y añade las credenciales de tu backend de AWS.

5.  **Ejecuta la aplicación:**
    ```bash
    npm run dev
    ```
