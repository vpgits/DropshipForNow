import { useState } from 'react';

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    graduationYear: '',
    major: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit form data to API
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Full Name"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="text"
        name="university"
        value={formData.university}
        onChange={handleChange}
        placeholder="University"
        required
      />
      <input
        type="number"
        name="graduationYear"
        value={formData.graduationYear}
        onChange={handleChange}
        placeholder="Graduation Year"
        required
      />
      <input
        type="text"
        name="major"
        value={formData.major}
        onChange={handleChange}
        placeholder="Major"
        required
      />
      <button type="submit">Save Profile</button>
    </form>
  );
};

export default ProfileForm;