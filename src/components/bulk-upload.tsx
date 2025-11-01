
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Student, Faculty, ClassFacultyMapping } from '@/lib/types';
import { mockStudents, mockFaculty } from '@/lib/mock-data';

interface BulkUploadProps {
  type: 'students' | 'faculty' | 'mappings';
}

export function BulkUpload({ type }: BulkUploadProps) {
  const { addBulkStudents, addBulkFaculty, addBulkMappings } = useAuth();
  const { toast } = useToast();
  
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allStudents = useMemo(() => mockStudents, []);
  const allFaculty = useMemo(() => mockFaculty, []);

  const config = {
    students: {
        title: "Bulk Add Students",
        description: "Paste CSV data. Required columns: `register_number`, `name`, `password`, `class_name`.",
        placeholder: "register_number,name,password,class_name\n1111222233334444,John Doe,password123,CS-A",
        headers: ['register_number', 'name', 'password', 'class_name'],
        handler: handleStudentUpload,
    },
    faculty: {
        title: "Bulk Add Faculty",
        description: "Paste CSV data. Required columns: `faculty_id`, `name`, `password`, `department`.",
        placeholder: "faculty_id,name,password,department\n123,Jane Smith,pass456,Computer Science",
        headers: ['faculty_id', 'name', 'password', 'department'],
        handler: handleFacultyUpload,
    },
    mappings: {
        title: "Bulk Add Mappings",
        description: "Paste CSV data. Required columns: `class_name`, `faculty_id`, `subject`.",
        placeholder: "class_name,faculty_id,subject\nCS-A,123,Data Structures",
        headers: ['class_name', 'faculty_id', 'subject'],
        handler: handleMappingUpload,
    }
  }[type];


  const processCsv = <T extends Record<string, string>>(
    csvText: string, 
    headers: (keyof T)[],
  ): T[] => {
    const results: T[] = [];
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    
    const pastedHeaders = lines[0].split(',').map(h => h.trim());
    const hasCorrectHeaders = headers.every((h, i) => pastedHeaders[i] === String(h));

    const dataLines = hasCorrectHeaders ? lines.slice(1) : lines;

    for (const line of dataLines) {
        const values = line.split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const obj = headers.reduce((acc, header, index) => {
            acc[header] = values[index];
            return acc;
        }, {} as T);
        results.push(obj);
    }
    return results;
  };

  async function handleStudentUpload() {
    if (!csvData.trim()) return;
    setIsLoading(true);
    try {
      const newStudents = processCsv<any>(csvData, config.headers as any);
      
      const existingRegNumbers = new Set(allStudents.map(s => s.register_number));
      const validNewStudents = newStudents.filter(s => s.register_number && !existingRegNumbers.has(s.register_number));

      if(validNewStudents.length > 0) {
        await addBulkStudents(validNewStudents);
      }

      toast({
        title: 'Upload Complete',
        description: `Successfully processed and added ${validNewStudents.length} new student(s). Skipped ${newStudents.length - validNewStudents.length} duplicates.`,
      });
      setCsvData('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process student data. Check for formatting errors.' });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleFacultyUpload() {
    if (!csvData.trim()) return;
    setIsLoading(true);
    try {
       const newFaculty = processCsv<any>(csvData, config.headers as any);

       const existingFacultyIds = new Set(allFaculty.map(f => f.faculty_id));
       const validNewFaculty = newFaculty.filter(f => f.faculty_id && !existingFacultyIds.has(f.faculty_id));
       
       if(validNewFaculty.length > 0) {
        await addBulkFaculty(validNewFaculty);
       }
       
      toast({
        title: 'Upload Complete',
        description: `Successfully processed and added ${validNewFaculty.length} new faculty member(s). Skipped ${newFaculty.length - validNewFaculty.length} duplicates.`,
      });
      setCsvData('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process faculty data. Check for formatting errors.' });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleMappingUpload() {
    if (!csvData.trim()) return;
    setIsLoading(true);
    try {
       const newMappings = processCsv<any>(csvData, config.headers as any);
       const validNewMappings = newMappings.filter(m => m.class_name && m.faculty_id && m.subject);

       if(validNewMappings.length > 0) {
         await addBulkMappings(validNewMappings);
       }
       
      toast({
        title: 'Upload Complete',
        description: `Successfully processed and added ${validNewMappings.length} new mapping(s).`,
      });
      setCsvData('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process mapping data. Check for formatting errors.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl mb-6">
        <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>
            {config.description}
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea 
                placeholder={config.placeholder}
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="min-h-[150px] font-mono text-xs"
            />
            <Button onClick={config.handler} disabled={!csvData.trim() || isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin"/> : <Upload className="mr-2" />}
                Process Data
            </Button>
        </CardContent>
    </Card>
  );
}
