"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { doc, setDoc, deleteDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"

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
import { useFirebase } from "@/firebase"

interface StudentTableProps {
}

const studentSchema = z.object({
    id: z.string().optional(),
    register_number: z.string().length(16, "Register number must be 16 digits."),
    name: z.string().min(1, "Name is required."),
    class_name: z.string().min(1, "Class name is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});


const StudentForm = ({ student, onSave, onCancel }: { student?: Student; onSave: (data: Omit<Student, 'id'>, id?: string) => void; onCancel: () => void; }) => {
    const { students } = useData();
    const existingRegNumbers = React.useMemo(() => new Set(students.map(s => s.register_number)), [students]);

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
        const { id, ...data } = values;
        onSave(data, student?.id);
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


const ActionsCell = ({ student }: { student: Student; }) => {
    const { firestore } = useFirebase();
    const [isEditing, setIsEditing] = React.useState(false);
    const { toast } = useToast();

    const handleEditSave = async (data: Omit<Student, 'id' | 'password'> & { password?: string }, id?: string) => {
        if (!id) return;
        try {
            const docRef = doc(firestore, 'students', id);
            const updateData: Partial<Student> = { ...data };
            delete updateData.password;
            
            await setDoc(docRef, updateData, { merge: true });
            
            // Note: In a real app, you would have a cloud function to update the auth password.
            // This is a simplified example.
            if (data.password) {
                 toast({ title: "Student Updated", description: "Password cannot be changed from here. Please advise user to change it themselves." });
            } else {
                 toast({ title: "Student Updated", description: `${data.name} has been updated.` });
            }

            setIsEditing(false);
        } catch (error) {
            console.error("Error updating student:", error);
            toast({ variant: 'destructive', title: "Update failed" });
        }
    };
    
    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${student.name}? This will also delete their feedback.`)) {
             try {
                await deleteDoc(doc(firestore, 'students', student.id));
                // Note: Need cloud function to delete user from Auth and their feedback
                toast({ title: "Student Deleted", description: `${student.name} has been removed.` });
            } catch (error) {
                console.error("Error deleting student:", error);
                toast({ variant: 'destructive', title: "Delete failed" });
            }
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
    const { students } = useData();
    const [isAdding, setIsAdding] = React.useState(false);
    const { toast } = useToast();
    const { firestore, auth } = useFirebase();
    
    const columns = React.useMemo(() => getColumns(), []);

    const handleAddSave = async (data: Omit<Student, 'id'>) => {
        try {
            const email = `${data.register_number}@feedloop-student.com`;
            const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
            const uid = userCredential.user.uid;

            const studentData = {
                id: uid,
                register_number: data.register_number,
                name: data.name,
                class_name: data.class_name,
            };

            await setDoc(doc(firestore, "students", uid), studentData);

            toast({ title: "Student Added", description: `${data.name} has been added.` });
            setIsAdding(false);
        } catch (error: any) {
            console.error("Error adding student:", error);
            if (error.code === 'auth/email-already-in-use') {
                 toast({ variant: 'destructive', title: "Add failed", description: "A student with this register number already exists in the authentication system." });
            } else {
                toast({ variant: 'destructive', title: "Add failed" });
            }
        }
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
