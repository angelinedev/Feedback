import { AvgRatingByDeptChart } from "@/components/charts/avg-rating-by-dept";
import { FacultyOutliersChart } from "@/components/charts/faculty-outliers";
import { TrendChart } from "@/components/charts/trend-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Analytics Dashboard</h1>
      </div>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="sm:col-span-2 shadow-2xl" x-chunk="dashboard-05-chunk-0">
              <CardHeader className="pb-3">
                <CardTitle>Welcome, Admin</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                  Here's an overview of the feedback data across the institution. Use these insights to identify trends and areas for improvement.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-2xl" x-chunk="dashboard-05-chunk-1">
              <CardHeader className="pb-2">
                <CardDescription>Overall Average Rating</CardDescription>
                <CardTitle className="text-4xl text-accent">4.3</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  +2.5% from last semester
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-2xl" x-chunk="dashboard-05-chunk-2">
              <CardHeader className="pb-2">
                <CardDescription>Total Feedback Submitted</CardDescription>
                <CardTitle className="text-4xl">1,250</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Across all departments
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>Average Rating by Department</CardTitle>
              <CardDescription>A comparative look at performance across departments.</CardDescription>
            </CardHeader>
            <CardContent>
              <AvgRatingByDeptChart />
            </CardContent>
          </Card>
           <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>College-wide Rating Trend</CardTitle>
              <CardDescription>Overall average rating tracked over historical semesters.</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendChart />
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>Top 5 Rated Faculty</CardTitle>
              <CardDescription>Faculty with the highest overall average ratings.</CardDescription>
            </CardHeader>
            <CardContent>
              <FacultyOutliersChart type="top" />
            </CardContent>
          </Card>
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>Bottom 5 Rated Faculty</CardTitle>
              <CardDescription>Faculty with the lowest overall average ratings.</CardDescription>
            </CardHeader>
            <CardContent>
              <FacultyOutliersChart type="bottom" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
