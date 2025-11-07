"use client";

import React, { useState, useMemo } from "react";
import { ApolloProvider, useQuery, useMutation } from "@apollo/client";
// IMPORTAMOS TODO LO QUE NECESITAMOS, INCLUYENDO LA NUEVA MUTACIÓN
import {
  client,
  Task,
  LIST_TASKS_QUERY,
  ADD_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
} from "../lib/apollo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function TaskManager() {
  const { data, loading, error, refetch } = useQuery<{ listTasks: Task[] }>(
    LIST_TASKS_QUERY
  );
  const [taskName, setTaskName] = useState("");

  const [addTask] = useMutation(ADD_TASK_MUTATION, {
    onCompleted: () => {
      refetch();
    },
  });

  // ==================================================================
  // PASO 1: PREPARAMOS LA MUTACIÓN DE ACTUALIZACIÓN
  // ==================================================================
  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    // ESTA ES LA ACTUALIZACIÓN OPTIMISTA. ¡MUY IMPORTANTE!
    optimisticResponse: (variables) => {
      // Creamos una "respuesta falsa" que Apollo usará inmediatamente.
      return {
        updateTask: {
          __typename: "Task", // Necesario para que Apollo sepa qué tipo de objeto es
          id: variables.id,
          name: variables.name,
          completed: variables.completed,
        },
      };
    },
  });

  const sortedTasks = useMemo(() => {
    if (!data?.listTasks) return [];
    const tasksToSort = [...data.listTasks];
    tasksToSort.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const timestampA = parseInt(a.id.split("-")[0], 10);
      const timestampB = parseInt(b.id.split("-")[0], 10);
      return timestampA - timestampB;
    });
    return tasksToSort;
  }, [data]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      addTask({ variables: { name: taskName } });
      setTaskName("");
    }
  };

  // ==================================================================
  // PASO 2: CREAMOS LA FUNCIÓN QUE MANEJA EL CLIC
  // ==================================================================
  const handleToggleTask = (task: Task) => {
    // Llamamos a la mutación `updateTask` con las variables correctas
    updateTask({
      variables: {
        id: task.id,
        name: task.name, // El nombre no cambia, pero es un campo obligatorio en nuestra mutación
        completed: !task.completed, // Invertimos el estado actual de "completed"
      },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
        <p className="text-lg font-semibold">Cargando tareas desde AWS...</p>
      </div>
    );
  }

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="w-full min-h-screen bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] py-12">
      <div className="max-w-[500px] my-5 mx-5 md:mx-auto ">
        <Card className="font-sans">
          <CardHeader>
            <h1 className="text-4xl font-bold text-center">
              Mi Lista de Tareas
            </h1>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form
              onSubmit={handleAddTask}
              className="flex  flex-col sm:flex-row gap-4"
            >
              <Input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Nueva tarea..."
                className="bg-white basis-3/4"
              />
              <Button type="submit" className="basis-1/4 cursor-pointer">
                <Archive className="w-4 me-2 opacity-60"></Archive>
                Agregar
              </Button>
            </form>

            <h2>Tareas Pendientes:</h2>
            <ul>
              {sortedTasks.map((task) => (
                // ==================================================================
                // PASO 3: CONECTAMOS LA FUNCIÓN AL EVENTO ONCLICK DEL ELEMENTO
                // ==================================================================
                <li
                  key={task.id}
                  onClick={() => handleToggleTask(task)} // ¡Aquí está la magia!
                  style={{
                    cursor: "pointer", // Cambiamos el cursor para que parezca clickeable
                    textDecoration: task.completed ? "line-through" : "none", // Tachamos si está completada
                    color: task.completed ? "grey" : "black", // Cambiamos el color si está completada
                    padding: "5px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {task.name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ApolloProvider client={client}>
      <TaskManager />
    </ApolloProvider>
  );
}
