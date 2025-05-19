import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MongoDBStatus({ data }) {
  if (!data || data.error) {
    return (
      <Card className="bg-red-100 border-red-400">
        <CardHeader className="text-red-800 font-semibold">
          MongoDB Atlas Error
        </CardHeader>
        <CardContent>
          {data?.error || "Unable to fetch MongoDB status."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-lg font-bold flex items-center gap-2">
        <img src="/mongodb.svg" alt="MongoDB" className="h-5 w-5" />
        MongoDB Atlas
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-800">
        <div>
          <strong>Cluster:</strong> {data.clusterName}
        </div>
        <div>
          <strong>Status:</strong>
          <Badge
            className={data.state === "IDLE" ? "bg-green-600" : "bg-yellow-500"}
          >
            {data.state}
          </Badge>
        </div>
        <div>
          <strong>Version:</strong> {data.mongoDBVersion}
        </div>
        <div>
          <strong>Size:</strong> {data.instanceSize} ({data.diskSizeGB} GB)
        </div>
        <div>
          <strong>Provider:</strong> {data.provider}
        </div>
        <div>
          <strong>Cluster Type:</strong> {data.clusterType}
        </div>
        <div>
          <strong>Paused:</strong> {data.paused ? "Yes" : "No"}
        </div>
        <div>
          <strong>Auto Scaling:</strong>
          <span className="ml-1">
            Compute {data.autoScaling.compute ? "✔️" : "❌"}, Disk{" "}
            {data.autoScaling.disk ? "✔️" : "❌"}
          </span>
        </div>
        <div>
          <strong>Connection:</strong>
          <div className="truncate text-blue-600">
            {data.connectionStrings.standardSrv}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
