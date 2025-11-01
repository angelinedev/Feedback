
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
import { useAuth } from "@/hooks/use-auth"

interface StudentTableProps {
}

const studentSchema = z.object({
    id: z.string().optional(),
    register_number: z.string().length(16, "Register number must be 16 digits."),
    name: z.string().min(1, "Name is required."),
    class_name: z.string().min(1, "Class name is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});


const StudentForm = ({ student, onSave, onCancel, allStudents }: { student?: Student; onSave: (data: Omit<Student, 'id' | 'password'>, password?: string) => void; onCancel: () => void; allStudents: Student[] }) => {

    const existingRegNumbers = React.useMemo(() => new Set(allStudents.map(s => s.register_number)), [allStudents]);

    const formSchema = studentSchema.extend({
        register_number: z.string().length(16, "Register number must be 16 digits.").refine(val => {
            if (student?.register_number === val) return true; // allow saving with the same number
            return !existingRegNumbers.has(val);
        }, "This register number already exists."),
         password: student ? z.string().optional().refine(val => !val || val.length >= 6, "New password must be at least 6 characters.") : z.string().min(6, "Password must be at least 6 characters."),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: student ? { ...student, password: "" } : { register_number: "", name: "", class_name: "", password: "" },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const { id, password, ...data } = values;
        onSave(data, password);
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
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder={student ? "Leave blank to keep current password" : "Set a password"} {...field} />
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


const ActionsCell = ({ student, allStudents }: { student: Student; allStudents: Student[] }) => {
    const { updateStudent, deleteStudent, updateStudentPassword } = useAuth();
    const [isEditing, setIsEditing] = React.useState(false);
    const { toast } = useToast();

    const handleEditSave = async (data: Omit<Student, 'id' | 'password'>, password?: string) => {
        await updateStudent(student.id, data);
        if(password) {
            await updateStudentPassword(student.id, password);
        }
        toast({ title: "Student Updated", description: `${data.name} has been updated.` });
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${student.name}? This will also delete their feedback.`)) {
            deleteStudent(student.id);
            toast({ title: "Student Deleted", description: `${student.name} has been removed.` });
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
                <StudentForm student={student} onSave={handleEditSave} onCancel={() => setIsEditing(false)} allStudents={allStudents} />
            </DialogContent>
        </Dialog>
        </>
    );
};

const getColumns = (allStudents: Student[]): ColumnDef<Student>[] => [
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
    cell: ({ row }) => <ActionsCell student={row.original} allStudents={allStudents} />,
  },
]

export function StudentTable({}: StudentTableProps) {
    const { addStudent, students: allStudents } = useAuth();
    const [isAdding, setIsAdding] = React.useState(false);
    const { toast } = useToast();

    const columns = React.useMemo(() => getColumns(allStudents), [allStudents]);

    const handleAddSave = async (data: Omit<Student, 'id' | 'password'>, password?: string) => {
        if (!password) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password is required for new students.' });
            return;
        }
        await addStudent(data, password);
        toast({ title: "Student Added", description: `${data.name} has been added.` });
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
                        <StudentForm onSave={handleAddSave} onCancel={() => setIsAdding(false)} allStudents={allStudents} />
                    </DialogContent>
                </Dialog>
            </div>
            <DataTable 
                columns={columns} 
                data={allStudents}
                filterColumn="name"
                filterPlaceholder="Filter by name..."
             />
        </CardContent>
    </Card>
  )
}
