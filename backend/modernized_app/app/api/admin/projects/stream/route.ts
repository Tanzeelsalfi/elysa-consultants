import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let timer: any;
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    async start(controller) {
      try {
        await dbConnect();
        let lastCount = await Project.countDocuments({});

        // Send initial count
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ count: lastCount })}\n\n`));

        timer = setInterval(async () => {
          try {
            const currentCount = await Project.countDocuments({});
            if (currentCount !== lastCount) {
              lastCount = currentCount;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ count: currentCount, changed: true })}\n\n`)
              );
            } else {
              // Heartbeat
              controller.enqueue(encoder.encode(`: heartbeat\n\n`));
            }
          } catch (err) {
            clearInterval(timer);
            try {
              controller.close();
            } catch {}
          }
        }, 3000);
      } catch (err) {
        try {
          controller.close();
        } catch {}
      }
    },
    cancel() {
      if (timer) clearInterval(timer);
    },
  });

  return new Response(customStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
