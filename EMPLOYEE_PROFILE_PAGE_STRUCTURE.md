# Employee Profile Page Structure
## Route: `/modules/employee-profile`

Based on User Stories: **US-E2-04**, **US-E2-05**, **US-E2-12**

---

## 📐 **Page Layout**

```
┌─────────────────────────────────────────────────────────────┐
│                    MY PROFILE                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  1. PROFILE PICTURE (US-E2-12)                        │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │                                                       │ │
│  │         ┌──────────────┐                             │ │
│  │         │              │                             │ │
│  │         │   [IMAGE]    │  ← Circular, 150x150px       │ │
│  │         │   or Icon    │                             │ │
│  │         └──────────────┘                             │ │
│  │                                                       │ │
│  │         [Upload Picture] or [Change Picture]         │ │
│  │         Max: 5MB | Formats: JPG, PNG, GIF, WEBP      │ │
│  │                                                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  2. PERSONAL INFORMATION (US-E2-04 - Read Only)      │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Full Name:        John Doe                          │ │
│  │  Employee Number:  EMP-001                          │ │
│  │  National ID:      123456789                         │ │
│  │  Date of Birth:    1990-01-15                       │ │
│  │  Gender:           Male                              │ │
│  │  Marital Status:   Single                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  3. BIOGRAPHY (US-E2-12)                              │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Tell us about yourself (optional)                   │ │
│  │  ┌───────────────────────────────────────────────┐  │ │
│  │  │                                               │  │ │
│  │  │  [Textarea - 500 chars max]                  │  │ │
│  │  │                                               │  │ │
│  │  └───────────────────────────────────────────────┘  │ │
│  │  Character count: 0/500                            │ │
│  │  [Save Biography]                                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  4. CONTACT INFORMATION (US-E2-05)                   │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Personal Email:  [john@email.com]                   │ │
│  │  Work Email:      [john@company.com] (read-only)     │ │
│  │  Mobile Phone:    [+1234567890]                      │ │
│  │  Home Phone:      [+1234567891] (optional)           │ │
│  │  [Save Contact Info]                                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  5. ADDRESS (US-E2-05)                                │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Street Address:  [123 Main St]                      │ │
│  │  City:            [New York]                         │ │
│  │  Country:         [United States]                     │ │
│  │  [Save Address]                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  6. RESUME / CV (REC-007)                            │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Current CV:                                          │ │
│  │  📄 my-cv.pdf                    [Download] [Remove]│ │
│  │  OR                                                  │ │
│  │  No CV uploaded                                      │ │
│  │                                                       │ │
│  │  [Upload CV]                                         │ │
│  │  Formats: PDF, DOC, DOCX, TXT (Max: 5MB)            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Component Structure**

### **Main Page Component**

```typescript
// /modules/employee-profile/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/employee-profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const { data } = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="employee-profile-page">
      <h1>My Profile</h1>
      
      {/* Section 1: Profile Picture */}
      <ProfilePictureSection 
        profile={profile}
        onUpdate={fetchProfile}
      />

      {/* Section 2: Personal Info (Read-only) */}
      <PersonalInfoSection profile={profile} />

      {/* Section 3: Biography */}
      <BiographySection 
        profile={profile}
        onUpdate={fetchProfile}
      />

      {/* Section 4: Contact Info */}
      <ContactInfoSection 
        profile={profile}
        onUpdate={fetchProfile}
      />

      {/* Section 5: Address */}
      <AddressSection 
        profile={profile}
        onUpdate={fetchProfile}
      />

      {/* Section 6: Resume/CV */}
      <ResumeSection 
        profile={profile}
        onUpdate={fetchProfile}
      />
    </div>
  );
}
```

---

## 📦 **Section Components**

### **1. Profile Picture Section**

```typescript
// components/ProfilePictureSection.tsx
'use client';

export default function ProfilePictureSection({ profile, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(profile?.profilePictureUrl || null);

  const handleUpload = async (file: File) => {
    // TODO: Upload file first, then update profile with URL
    // For now, you'll need to create an upload endpoint
    // Or use a service like Cloudinary, then update with URL
    
    setUploading(true);
    try {
      // Step 1: Upload image (you need to implement this endpoint)
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch(`${API_URL}/employee-profile/me/upload-picture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const { imageUrl } = await uploadRes.json();
      
      // Step 2: Update profile
      await fetch(`${API_URL}/employee-profile/me/profile-picture`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePictureUrl: imageUrl }),
      });
      
      onUpdate();
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-picture-section">
      <h2>Profile Picture</h2>
      <div className="picture-container">
        {preview ? (
          <img src={preview} alt="Profile" className="profile-pic" />
        ) : (
          <div className="placeholder">No Picture</div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />
      <p>Max: 5MB | JPG, PNG, GIF, WEBP</p>
    </div>
  );
}
```

### **2. Biography Section**

```typescript
// components/BiographySection.tsx
'use client';

export default function BiographySection({ profile, onUpdate }) {
  const [biography, setBiography] = useState(profile?.biography || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/employee-profile/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ biography }),
      });
      onUpdate();
      alert('Biography saved!');
    } catch (error) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="biography-section">
      <h2>Biography</h2>
      <textarea
        value={biography}
        onChange={(e) => setBiography(e.target.value)}
        placeholder="Tell us about yourself..."
        maxLength={500}
        rows={5}
      />
      <div>{biography.length}/500 characters</div>
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Biography'}
      </button>
    </div>
  );
}
```

### **3. Resume Section**

```typescript
// components/ResumeSection.tsx
'use client';

export default function ResumeSection({ profile, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [cvDocument, setCvDocument] = useState<any>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use candidate ID - you might need to get this from user context
      const candidateId = profile?.candidateId || user?.candidateId;
      
      const response = await fetch(
        `${API_URL}/recruitment/candidates/${candidateId}/upload-cv`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCvDocument(result);
        onUpdate();
      }
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resume-section">
      <h2>Resume / CV</h2>
      
      {cvDocument ? (
        <div>
          <p>📄 {cvDocument.filename}</p>
          <button onClick={() => {/* Download */}}>Download</button>
          <button onClick={() => setCvDocument(null)}>Remove</button>
        </div>
      ) : (
        <p>No CV uploaded</p>
      )}

      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />
      <p>Formats: PDF, DOC, DOCX, TXT (Max: 5MB)</p>
    </div>
  );
}
```

---

## 🔗 **Backend Endpoints**

```
GET    /employee-profile/me                    - Get profile (includes biography)
PATCH  /employee-profile/me                    - Update profile (biography, contact, address, picture URL)
PATCH  /employee-profile/me/profile-picture     - Update picture URL only
PATCH  /employee-profile/me/contact            - Update contact info only
PATCH  /employee-profile/me/address             - Update address only
POST   /recruitment/candidates/:id/upload-cv    - Upload CV
GET    /recruitment/candidates/:id/cv/:docId   - Download CV
```

---

## ✅ **What's Now Available**

- ✅ **Biography** added to `UpdateMyProfileDto` (max 500 chars)
- ✅ **Biography** handling in `updateMyProfile()` service method
- ✅ Can update biography via `PATCH /employee-profile/me` with `{ biography: "..." }`

---

## 📝 **Frontend Usage for Biography**

```typescript
// Update biography
const response = await fetch(`${API_URL}/employee-profile/me`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    biography: 'My short bio here...',
  }),
});
```

The biography field is now fully supported in the backend!

