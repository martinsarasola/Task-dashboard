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
  DELETE_TASK_MUTATION,
} from "../lib/apollo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Archive, Trash2 } from "lucide-react";
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

  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    // ESTA VEZ USAREMOS LA FUNCIÓN `update` PARA MANIPULAR EL CACHÉ MANUALMENTE
    update(cache, { data: { deleteTask: deletedTask } }) {
      // 1. Leemos la query actual de la lista de tareas desde el caché
      const existingTasksData = cache.readQuery<{ listTasks: Task[] }>({
        query: LIST_TASKS_QUERY,
      });

      if (existingTasksData) {
        // 2. Filtramos la lista, eliminando la tarea cuyo ID coincide con la que borramos
        const newTasks = existingTasksData.listTasks.filter(
          (task) => task.id !== deletedTask.id
        );

        // 3. Escribimos la nueva lista (ya sin la tarea borrada) de vuelta en el caché
        cache.writeQuery({
          query: LIST_TASKS_QUERY,
          data: { listTasks: newTasks },
        });
      }
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

  const handleDeleteTask = (id: string) => {
    // Llamamos a la mutación `deleteTask` con el ID de la tarea
    deleteTask({
      variables: { id },
      // TAMBIÉN PODEMOS HACER UNA ACTUALIZACIÓN OPTIMISTA AQUÍ
      optimisticResponse: {
        deleteTask: {
          __typename: "Task",
          id: id,
        },
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
                  onClick={() => handleToggleTask(task)}
                  className={`
                  cursor-pointer border-b border-[#eee] p-[5px] flex flex-row justify-between
                  ${
                    task.completed ? "line-through text-gray-500" : "text-black"
                  }
                `}
                >
                  {task.name}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    variant="ghost"
                    className=""
                  >
                    <Trash2 className="h-5 w-5 text-destructive"></Trash2>
                  </Button>
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
