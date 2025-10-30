"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { DataTable } from "./data-table"
import type { Student } from "@/lib/types"
import { mockStudents } from "@/lib/mock-data"


const ActionsCell = ({ student }: { student: Student }) => {
    // Add logic for Edit/Delete here
    const handleEdit = () => alert(`Editing ${student.name}`);
    const handleDelete = () => alert(`Deleting ${student.name}`);
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
};

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "register_number",
    header: "Register Number",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "class_name",
    header: "Class",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell student={row.original} />,
  },
]

export function StudentTable() {
    const [data, setData] = React.useState<Student[]>(mockStudents);

    // Logic for adding a new student
    const handleAdd = () => {
        alert("Opening form to add new student...")
    }

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Add, edit, and remove student records.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                </Button>
            </div>
            <DataTable 
                columns={columns} 
                data={data}
                filterColumn="name"
                filterPlaceholder="Filter by name..."
             />
        </CardContent>
    </Card>
  )
}
