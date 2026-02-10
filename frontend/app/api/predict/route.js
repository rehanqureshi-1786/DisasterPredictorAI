export async function GET() {
  return Response.json({ status: "API working" });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { city } = body;

    return Response.json({
      success: true,
      message: `Received city: ${city}`,
    });
  } catch (error) {
    return Response.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
