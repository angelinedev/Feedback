
"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { useData } from "../data-provider"

interface StudentTableProps {
}

const studentSchema = z.object({
    id: z.string().optional(),
    register_number: z.string().length(16, "Register number must be 16 digits."),
    name: z.string().min(1, "Name is required."),
    class_name: z.string().min(1, "Class name is required."),
    password: z.string().optional(),
});


const StudentForm = ({ student, onSave, onCancel }: { student?: Student; onSave: (data: Student) => void; onCancel: () => void; }) => {
    const { students } = useData();
    const existingRegNumbers = React.useMemo(() => new Set(students.map(s => s.register_number)), [students]);

    const formSchema = studentSchema.extend({
        register_number: z.string().length(16, "Register number must be 16 digits.").refine(val => {
            if (student?.register_number === val) return true; // allow saving with the same number
            return !existingRegNumbers.has(val);
        }, "This register number already exists."),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: student || { register_number: "", name: "", class_name: "" },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSave({ ...values, id: student?.id || values.register_number, password: student?.password || 'password123' });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="register_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Register Number</FormLabel>
                            <FormControl>
                                <Input placeholder="16-digit register number" {...field} disabled={!!student} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Student's name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="class_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., CS-A" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


const ActionsCell = ({ student }: { student: Student; }) => {
    const { setStudents } = useData();
    const [isEditing, setIsEditing] = React.useState(false);

    const handleEditSave = (updatedStudent: Student) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            setStudents(prev => prev.filter(s => s.id !== student.id));
        }
    };
  
    return (
        <>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Student</DialogTitle>
                    <DialogDescription>Update the details for this student.</DialogDescription>
                </DialogHeader>
                <StudentForm student={student} onSave={handleEditSave} onCancel={() => setIsEditing(false)} />
            </DialogContent>
        </Dialog>
        </>
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

export function StudentTable({}: StudentTableProps) {
    const { students, setStudents } = useData();
    const [isAdding, setIsAdding] = React.useState(false);
    const { toast } = useToast();
    
    const columns = React.useMemo(() => getColumns(), []);

    const handleAddSave = (newStudent: Student) => {
        setStudents(prev => [...prev, newStudent]);
        toast({ title: "Student Added", description: `${newStudent.name} has been added.` });
        setIsAdding(false);
    };

  return (
    <Card className="shadow-2xl">
        <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Add, edit, and remove student records.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-end mb-4">
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                            <DialogDescription>Enter the details for the new student.</DialogDescription>
                        </DialogHeader>
                        <StudentForm onSave={handleAddSave} onCancel={() => setIsAdding(false)} />
                    </DialogContent>
                </Dialog>
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
