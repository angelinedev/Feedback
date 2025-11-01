
"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


export default function AdminDashboard() {

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Analytics Dashboard</h1>
      </div>
      <div className="grid flex-1 auto-rows-max items-start gap-4 md:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Card className="sm:col-span-4 shadow-2xl" x-chunk="dashboard-05-chunk-0">
            <CardHeader className="pb-3">
                <CardTitle>Welcome, Admin</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                The analytics and reporting features are currently being set up.
                </CardDescription>
            </CardHeader>
            </Card>
        </div>
        
        <Separator className="my-4" />

      </div>
    </>
  )
}
