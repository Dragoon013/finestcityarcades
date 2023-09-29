import { sql } from "@vercel/postgres";

export async function actions({ request }) {
  const formData = Object.fromEntries(await request.formData());
  return {
    success:true,
    formData
  }
}