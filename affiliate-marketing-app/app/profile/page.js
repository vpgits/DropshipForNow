"use client";
import Layout from '../components/Layout';
import ProfileForm from '../components/ProfileForm';

export default function Profile() {
  return (
    <Layout>
      <h1>Your Profile</h1>
      <ProfileForm />
    </Layout>
  );
}