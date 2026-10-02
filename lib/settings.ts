import 'server-only';
import { db } from './db';

export const draftStatement = `Flere blues-koncerter på Blågårds Apotek 🎸
Blågårds Apotek har historisk været kendt som et spillested, hvor bluesmusikken har haft en naturlig plads – ikke mindst takket være grundlægger Hans Henry Nielsen og hans bluesband, YYYYY.

Flere gæster har givet udtryk for et ønske om flere blueskoncerter på Apoteket og for at præsentere bluesmusikken i hele dens musikalske bredde og mange undergenrer.

Derfor foreslås det, at Blågårds Apotek etablerer et fast, månedligt blues-arrangement i to årlige sæsoner:

Forår: marts, april og maj
Efterår: september, oktober og november

Det vil give mulighed for løbende at booke forskellige bluesartister og samtidig videreføre den bluestradition, som historisk har været en del af Blågårds Apoteks identitet.

Jeg bakker op om initiativet om at skabe flere blueskoncerter på Blågårds Apotek og støtter forslaget om et fast, månedligt blues-arrangement i de nævnte sæsoner`;

export type PetitionSettings = { title: string; statement: string; revision: number; draft: string; manager_email: string; canvas_color: string; ink_color: string; accent_color: string };

let installation: Promise<void> | undefined;
async function install() {
  if (!process.env.DATABASE_URL) return;
  installation ??= (async () => {
    const sql = db();
    await sql`CREATE TABLE IF NOT EXISTS petition_settings (
      id integer PRIMARY KEY CHECK (id = 1),
      title text NOT NULL,
      statement text NOT NULL DEFAULT '',
      revision integer NOT NULL DEFAULT 0,
      draft text NOT NULL,
      manager_email text NOT NULL,
      canvas_color text NOT NULL DEFAULT '#fff4c4',
      ink_color text NOT NULL DEFAULT '#000000',
      accent_color text NOT NULL DEFAULT '#dfee4b',
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`ALTER TABLE petition_settings ADD COLUMN IF NOT EXISTS canvas_color text NOT NULL DEFAULT '#fff4c4'`;
    await sql`ALTER TABLE petition_settings ADD COLUMN IF NOT EXISTS ink_color text NOT NULL DEFAULT '#000000'`;
    await sql`ALTER TABLE petition_settings ADD COLUMN IF NOT EXISTS accent_color text NOT NULL DEFAULT '#dfee4b'`;
    await sql`ALTER TABLE interests ADD COLUMN IF NOT EXISTS marketing_requested boolean NOT NULL DEFAULT false`;
    await sql`ALTER TABLE interests ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz`;
    await sql`ALTER TABLE interests ADD COLUMN IF NOT EXISTS marketing_consent_text text`;
    await sql`ALTER TABLE interests ADD COLUMN IF NOT EXISTS marketing_withdrawn_at timestamptz`;
    await sql`ALTER TABLE interests ADD COLUMN IF NOT EXISTS age_band text`;
    await sql`ALTER TABLE interests ADD COLUMN IF NOT EXISTS confirmation_message_id text`;
    await sql`INSERT INTO petition_settings (id, title, statement, revision, draft, manager_email)
      VALUES (1, 'Flere blues-koncerter på Blågårds Apotek', '', 0, ${draftStatement}, 'izakhyllested@icloud.com')
      ON CONFLICT (id) DO NOTHING`;
  })().catch(error => { installation = undefined; throw error; });
  await installation;
}

export async function petitionSettings(): Promise<PetitionSettings | null> {
  if (!process.env.DATABASE_URL) return null;
  await install();
  const rows = await db()`SELECT title, statement, revision, draft, manager_email, canvas_color, ink_color, accent_color FROM petition_settings WHERE id = 1`;
  return rows[0] as PetitionSettings | undefined || null;
}
