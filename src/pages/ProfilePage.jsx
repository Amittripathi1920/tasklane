import { LoaderCircle, Mars, Users, Venus } from "lucide-react";
import { Badge, Button, Card, Field, Input, SelectField } from "../components/ui";
import { formatDate } from "../lib/utils";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const PROFILE_AVATAR_URL =
  "https://plus.unsplash.com/premium_photo-1739376473691-cdc1db244ac6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function normalizeGender(value) {
  const gender = String(value || "").trim();
  if (gender === "Female") return "Female";
  if (gender === "Other") return "Other";
  return "Male";
}

function GenderIcon({ gender, className = "h-4 w-4" }) {
  const normalized = normalizeGender(gender);
  if (normalized === "Female") return <Venus className={className} />;
  if (normalized === "Other") return <Users className={className} />;
  return <Mars className={className} />;
}

export default function ProfilePage({ currentUser, profileForm, setProfileForm, onSave, saving }) {
  return (
    <div className="space-y-5">
      <Card className="min-w-0 overflow-hidden p-0">
        <div className="border-b border-[#ececf0] bg-[linear-gradient(135deg,#fff7f2,#fff,#f4f6fb)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/70 shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
                <img src={PROFILE_AVATAR_URL} alt={currentUser?.name || "Profile"} className="h-full w-full object-cover" />
                <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-[#23242a] text-white">
                  <GenderIcon gender={profileForm.gender} className="h-4 w-4" />
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f9098]">Profile</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#23242a]">{currentUser?.name || "User"}</h2>
                <p className="mt-1 text-sm text-[#7b7c85]">{currentUser?.email}</p>
              </div>
            </div>
            <Badge className="border-[#ececf0] bg-white text-[#5f6169]">{currentUser?.role || "Member"}</Badge>
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <Field label="Full name">
              <Input className="border-[#e5e5e9] bg-[#fafafa] text-[#1f1f1f]" value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" />
            </Field>
            <Field label="Email">
              <Input className="border-[#e5e5e9] bg-[#f6f7f9] text-[#7b7c85]" value={profileForm.email} disabled />
            </Field>
            <Field label="Gender">
              <SelectField value={normalizeGender(profileForm.gender)} onValueChange={(value) => setProfileForm((current) => ({ ...current, gender: value }))} options={GENDER_OPTIONS} />
            </Field>
            <div className="flex justify-end">
              <Button className="bg-[#2160ff] text-white hover:bg-[#184ed4]" onClick={onSave} disabled={saving}>
                {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Profile
              </Button>
            </div>
          </div>

          <Card className="p-5">
            <p className="text-sm font-semibold text-[#23242a]">Profile details</p>
            <div className="mt-4 space-y-3 text-sm text-[#5f6169]">
              <div className="flex items-center justify-between gap-3">
                <span>Default avatar</span>
                <span className="font-medium text-[#23242a]">Photo mask enabled</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Gender icon</span>
                <span className="inline-flex items-center gap-2 font-medium text-[#23242a]">
                  <GenderIcon gender={profileForm.gender} className="h-4 w-4" />
                  {normalizeGender(profileForm.gender)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Workspace role</span>
                <span className="font-medium text-[#23242a]">{currentUser?.role || "Member"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Joined</span>
                <span className="font-medium text-[#23242a]">{formatDate(currentUser?.createdAt, "Unknown")}</span>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}
