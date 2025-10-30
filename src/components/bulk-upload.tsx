
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Users, Briefcase, Loader2 } from 'lucide-react';
import { useData } from './data-provider';

export function BulkUpload() {
  const { addStudent, addFaculty } = useData();
  const { toast } = useToast();
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [facultyFile, setFacultyFile] = useState<File | null>(null);
  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const [isFacultyLoading, setIsFacultyLoading] = useState(false);

  const processCSV = (file: File, type: 'student' | 'faculty') => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("No file selected."));
        }
        if(type === 'student') setIsStudentLoading(true);
        else setIsFacultyLoading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csv = event.target?.result as string;
                const lines = csv.split(/\r\n|\n/);
                const headers = lines[0].split(',').map(h => h.trim());
                let addedCount = 0;

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (!line.trim()) continue;

                    const values = line.split(',').map(v => v.trim());
                    const obj = headers.reduce((acc, header, index) => {
                        (acc as any)[header] = values[index];
                        return acc;
                    }, {});

                    if (type === 'student') {
                        const { name, register_number, class_name, password } = obj as any;
                        if(name && register_number && class_name && password) {
                            addStudent({ name, register_number, class_name }, password);
                            addedCount++;
                        }
                    } else if (type === 'faculty') {
                        const { name, faculty_id, department, password } = obj as any;
                         if(name && faculty_id && department && password) {
                            addFaculty({ name, faculty_id, department }, password);
                            addedCount++;
                         }
                    }
                }
                resolve(addedCount);
            } catch (error) {
                reject(error);
            } finally {
                if(type === 'student') setIsStudentLoading(false);
                else setIsFacultyLoading(false);
            }
        };
        reader.onerror = (error) => {
            reject(error);
            if(type === 'student') setIsStudentLoading(false);
            else setIsFacultyLoading(false);
        };
        reader.readAsText(file);
    });
  };

  const handleStudentUpload = async () => {
    if (!studentFile) return;
    try {
      const count = await processCSV(studentFile, 'student');
      toast({
        title: 'Upload Successful',
        description: `Successfully added ${count} student(s).`,
      });
      setStudentFile(null);
      // Reset the input element
      const input = document.getElementById('student-file-input') as HTMLInputElement;
      if (input) input.value = '';

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'An error occurred while processing the student CSV.',
      });
    }
  };

  const handleFacultyUpload = async () => {
    if (!facultyFile) return;
     try {
      const count = await processCSV(facultyFile, 'faculty');
      toast({
        title: 'Upload Successful',
        description: `Successfully added ${count} faculty member(s).`,
      });
      setFacultyFile(null);
      // Reset the input element
      const input = document.getElementById('faculty-file-input') as HTMLInputElement;
      if (input) input.value = '';
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'An error occurred while processing the faculty CSV.',
      });
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Bulk Upload Students</CardTitle>
          </div>
          <CardDescription>
            Upload a CSV file to add multiple students at once. The required columns are: `name`, `register_number`, `class_name`, and `password`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input id="student-file-input" type="file" accept=".csv" onChange={(e) => setStudentFile(e.target.files?.[0] || null)} />
          <Button onClick={handleStudentUpload} disabled={!studentFile || isStudentLoading} className="w-full">
            {isStudentLoading ? <Loader2 className="animate-spin"/> : <Upload className="mr-2" />}
            Upload Students
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-primary" />
            <CardTitle>Bulk Upload Faculty</CardTitle>
          </div>
          <CardDescription>
            Upload a CSV file to add multiple faculty members. The required columns are: `name`, `faculty_id`, `department`, and `password`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input id="faculty-file-input" type="file" accept=".csv" onChange={(e) => setFacultyFile(e.target.files?.[0] || null)} />
          <Button onClick={handleFacultyUpload} disabled={!facultyFile || isFacultyLoading} className="w-full">
            {isFacultyLoading ? <Loader2 className="animate-spin"/> : <Upload className="mr-2" />}
            Upload Faculty
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

