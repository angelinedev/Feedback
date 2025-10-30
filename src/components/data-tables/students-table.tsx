
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
import { useToast } from "@/hooks/use-toast"
import { useData } from "../data-provider"


const ActionsCell = ({ student }: { student: Student }) => {
    const { setStudents } = useData();
    const handleEdit = () => {
        const newName = prompt("Enter new name:", student.name);
        if (!newName) return;
        const newClass = prompt("Enter new class:", student.class_name);
        if (!newClass) return;
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, name: newName, class_name: newClass } : s));
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            setStudents(prev => prev.filter(s => s.id !== student.id));
        }
    };
  
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

const getColumns = (): ColumnDef<Student>[] => [
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
    const { students, setStudents } = useData();
    const { toast } = useToast();
    const columns = React.useMemo(() => getColumns(), []);
    
    const handleAdd = () => {
        const regNum = prompt("Enter Register Number:");
        if (!regNum) return;

        if (students.some(s => s.register_number === regNum)) {
            toast({
                variant: 'destructive',
                title: "Duplicate Register Number",
                description: "A student with this register number already exists.",
            });
            return;
        }

        const name = prompt("Enter Name:");
        if (!name) return;
        const className = prompt("Enter Class Name:");
        if (!className) return;
        const password = "password123";

        setStudents(prev => [...prev, { id: regNum, register_number: regNum, name, class_name: className, password}]);
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
                data={students}
                filterColumn="name"
                filterPlaceholder="Filter by name..."
             />
        </CardContent>
    </Card>
  )
}
