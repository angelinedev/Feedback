
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Users, Briefcase, BrainCircuit, Loader2 } from 'lucide-react';
import { useData } from './data-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function BulkUpload() {
  const { addStudent, addFaculty, addMapping, faculty: allFaculty, students: allStudents } = useData();
  const { toast } = useToast();
  
  const [studentCsv, setStudentCsv] = useState('');
  const [facultyCsv, setFacultyCsv] = useState('');
  const [mappingCsv, setMappingCsv] = useState('');

  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const [isFacultyLoading, setIsFacultyLoading] = useState(false);
  const [isMappingLoading, setIsMappingLoading] = useState(false);

  const processCsv = <T extends Record<string, string>>(
    csvText: string, 
    headers: (keyof T)[],
    processor: (item: T) => boolean | void
  ) => {
    let addedCount = 0;
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    
    // Check headers of the pasted data
    const pastedHeaders = lines[0].split(',').map(h => h.trim());
    const hasCorrectHeaders = headers.every((h, i) => pastedHeaders[i] === h);

    const dataLines = hasCorrectHeaders ? lines.slice(1) : lines;

    for (const line of dataLines) {
        const values = line.split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const obj = headers.reduce((acc, header, index) => {
            acc[header] = values[index];
            return acc;
        }, {} as T);

        if (processor(obj)) {
          addedCount++;
        }
    }
    return addedCount;
  };

  const handleStudentUpload = () => {
    if (!studentCsv.trim()) return;
    setIsStudentLoading(true);
    try {
      const existingRegNumbers = new Set(allStudents.map(s => s.register_number));
      const headers = ['register_number', 'name', 'password', 'class_name'];
      
      const count = processCsv(studentCsv, headers, (item: any) => {
        if (item.register_number && item.name && item.password && item.class_name && !existingRegNumbers.has(item.register_number)) {
          addStudent({ name: item.name, register_number: item.register_number, class_name: item.class_name }, item.password);
          existingRegNumbers.add(item.register_number); // Add to set to handle duplicates within the same CSV
          return true;
        }
        return false;
      });

      toast({
        title: 'Upload Complete',
        description: `Successfully processed and added ${count} new student(s).`,
      });
      setStudentCsv('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process student data. Check for formatting errors.' });
    } finally {
      setIsStudentLoading(false);
    }
  };

  const handleFacultyUpload = () => {
    if (!facultyCsv.trim()) return;
    setIsFacultyLoading(true);
    try {
       const existingFacultyIds = new Set(allFaculty.map(f => f.faculty_id));
       const headers = ['faculty_id', 'name', 'password', 'department'];

       const count = processCsv(facultyCsv, headers, (item: any) => {
         if (item.faculty_id && item.name && item.password && item.department && !existingFacultyIds.has(item.faculty_id)) {
            addFaculty({ name: item.name, faculty_id: item.faculty_id, department: item.department }, item.password);
            existingFacultyIds.add(item.faculty_id);
            return true;
         }
         return false;
       });

      toast({
        title: 'Upload Complete',
        description: `Successfully processed and added ${count} new faculty member(s).`,
      });
      setFacultyCsv('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process faculty data. Check for formatting errors.' });
    } finally {
      setIsFacultyLoading(false);
    }
  };

  const handleMappingUpload = () => {
    if (!mappingCsv.trim()) return;
    setIsMappingLoading(true);
    try {
       const headers = ['class_name', 'faculty_id', 'subject'];
       const count = processCsv(mappingCsv, headers, (item: any) => {
         if (item.class_name && item.faculty_id && item.subject) {
            addMapping({ class_name: item.class_name, faculty_id: item.faculty_id, subject: item.subject });
            return true;
         }
         return false;
       });
      toast({
        title: 'Upload Complete',
        description: `Successfully processed and added ${count} new mapping(s).`,
      });
      setMappingCsv('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process mapping data. Check for formatting errors.' });
    } finally {
      setIsMappingLoading(false);
    }
  };

  return (
    <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students"><Users className="mr-2" />Students</TabsTrigger>
          <TabsTrigger value="faculty"><Briefcase className="mr-2" />Faculty</TabsTrigger>
          <TabsTrigger value="mappings"><BrainCircuit className="mr-2" />Mappings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="students">
            <Card className="shadow-2xl">
                <CardHeader>
                <CardTitle>Bulk Add Students</CardTitle>
                <CardDescription>
                    Paste CSV data here. The required columns are: `register_number`, `name`, `password`, `class_name`.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                        placeholder="register_number,name,password,class_name&#10;1111222233334444,John Doe,password123,CS-A"
                        value={studentCsv}
                        onChange={(e) => setStudentCsv(e.target.value)}
                        className="min-h-[200px] font-mono text-xs"
                    />
                    <Button onClick={handleStudentUpload} disabled={!studentCsv.trim() || isStudentLoading} className="w-full">
                        {isStudentLoading ? <Loader2 className="animate-spin"/> : <Upload className="mr-2" />}
                        Process Students
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="faculty">
            <Card className="shadow-2xl">
                <CardHeader>
                <CardTitle>Bulk Add Faculty</CardTitle>
                <CardDescription>
                    Paste CSV data here. The required columns are: `faculty_id`, `name`, `password`, `department`.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                        placeholder="faculty_id,name,password,department&#10;123,Jane Smith,pass456,Computer Science"
                        value={facultyCsv}
                        onChange={(e) => setFacultyCsv(e.target.value)}
                        className="min-h-[200px] font-mono text-xs"
                    />
                    <Button onClick={handleFacultyUpload} disabled={!facultyCsv.trim() || isFacultyLoading} className="w-full">
                        {isFacultyLoading ? <Loader2 className="animate-spin"/> : <Upload className="mr-2" />}
                        Process Faculty
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="mappings">
            <Card className="shadow-2xl">
                <CardHeader>
                <CardTitle>Bulk Add Mappings</CardTitle>
                <CardDescription>
                    Paste CSV data here. The required columns are: `class_name`, `faculty_id`, `subject`.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                        placeholder="class_name,faculty_id,subject&#10;CS-A,123,Data Structures"
                        value={mappingCsv}
                        onChange={(e) => setMappingCsv(e.target.value)}
                        className="min-h-[200px] font-mono text-xs"
                    />
                    <Button onClick={handleMappingUpload} disabled={!mappingCsv.trim() || isMappingLoading} className="w-full">
                        {isMappingLoading ? <Loader2 className="animate-spin"/> : <Upload className="mr-2" />}
                        Process Mappings
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
