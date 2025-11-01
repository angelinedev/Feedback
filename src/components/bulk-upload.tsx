
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Users, Briefcase, BrainCircuit, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { Student, Faculty, ClassFacultyMapping } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirebase } from '@/firebase/provider';
import { collection } from 'firebase/firestore';

export function BulkUpload() {
  const { addBulkStudents, addBulkFaculty, addBulkMappings } = useAuth();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const { data: students } = useCollection<Student>(collection(firestore, 'students'));
  const { data: faculty } = useCollection<Faculty>(collection(firestore, 'faculty'));
  
  const [studentCsv, setStudentCsv] = useState('');
  const [facultyCsv, setFacultyCsv] = useState('');
  const [mappingCsv, setMappingCsv] = useState('');

  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const [isFacultyLoading, setIsFacultyLoading] = useState(false);
  const [isMappingLoading, setIsMappingLoading] = useState(false);

  const allStudents = useMemo(() => students || [], [students]);
  const allFaculty = useMemo(() => faculty || [], [faculty]);

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

  const handleStudentUpload = async () => {
    if (!studentCsv.trim()) return;
    setIsStudentLoading(true);
    try {
      const headers: (keyof Omit<Student, 'id'>)[] = ['register_number', 'name', 'password', 'class_name'];
      const newStudents = processCsv<any>(studentCsv, headers);
      
      const existingRegNumbers = new Set(allStudents.map(s => s.register_number));
      const validNewStudents = newStudents.filter(s => s.register_number && !existingRegNumbers.has(s.register_number));

      if(validNewStudents.length > 0) {
        await addBulkStudents(validNewStudents);
      }

      toast({
        title: 'Upload Complete',
        description: `Successfully processed and added ${validNewStudents.length} new student(s). Skipped ${newStudents.length - validNewStudents.length} duplicates.`,
      });
      setStudentCsv('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process student data. Check for formatting errors.' });
    } finally {
      setIsStudentLoading(false);
    }
  };

  const handleFacultyUpload = async () => {
    if (!facultyCsv.trim()) return;
    setIsFacultyLoading(true);
    try {
       const headers: (keyof Omit<Faculty, 'id'>)[] = ['faculty_id', 'name', 'password', 'department'];
       const newFaculty = processCsv<any>(facultyCsv, headers);

       const existingFacultyIds = new Set(allFaculty.map(f => f.faculty_id));
       const validNewFaculty = newFaculty.filter(f => f.faculty_id && !existingFacultyIds.has(f.faculty_id));
       
       if(validNewFaculty.length > 0) {
        await addBulkFaculty(validNewFaculty);
       }
       
      toast({
        title: 'Upload Complete',
        description: `Successfully processed and added ${validNewFaculty.length} new faculty member(s). Skipped ${newFaculty.length - validNewFaculty.length} duplicates.`,
      });
      setFacultyCsv('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process faculty data. Check for formatting errors.' });
    } finally {
      setIsFacultyLoading(false);
    }
  };

  const handleMappingUpload = async () => {
    if (!mappingCsv.trim()) return;
    setIsMappingLoading(true);
    try {
       const headers: (keyof Omit<ClassFacultyMapping, 'id'>)[] = ['class_name', 'faculty_id', 'subject'];
       const newMappings = processCsv<any>(mappingCsv, headers);
       const validNewMappings = newMappings.filter(m => m.class_name && m.faculty_id && m.subject);

       if(validNewMappings.length > 0) {
         await addBulkMappings(validNewMappings);
       }
       
      toast({
        title: 'Upload Complete',
        description: `Successfully processed and added ${validNewMappings.length} new mapping(s).`,
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
