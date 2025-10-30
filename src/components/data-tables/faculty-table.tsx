
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
import type { Faculty } from "@/lib/types"

interface FacultyTableProps {
  data: Faculty[];
}

const ActionsCell = ({ faculty }: { faculty: Faculty }) => {
    // Add logic for Edit/Delete here
    const handleEdit = () => alert(`Editing ${faculty.name}`);
    const handleDelete = () => alert(`Deleting ${faculty.name}`);
  
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

const columns: ColumnDef<Faculty>[] = [
  {
    accessorKey: "faculty_id",
    header: "Faculty ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell faculty={row.original} />,
  },
]

export function FacultyTable({ data }: FacultyTableProps) {
    const handleAdd = () => {
        alert("Opening form to add new faculty...")
    }

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Faculty</CardTitle>
            <CardDescription>Add, edit, and remove faculty records.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Faculty
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
