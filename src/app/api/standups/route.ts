import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const studentId = searchParams.get("student_id");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  let query = supabase.from("standups").select("*").order("date", { ascending: false });

  if (date) query = query.eq("date", date);
  if (studentId) query = query.eq("student_id", studentId);
  if (dateFrom) query = query.gte("date", dateFrom);
  if (dateTo) query = query.lte("date", dateTo);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Upsert: if standup exists for this student+date, update it
  const { data: existing } = await supabase
    .from("standups")
    .select("id")
    .eq("student_id", body.student_id)
    .eq("date", body.date)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("standups")
      .update(body)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase.from("standups").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
