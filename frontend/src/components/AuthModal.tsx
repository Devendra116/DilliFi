import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Mail, Lock, User, Wallet } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      // Simulate local sign-up without Supabase
      await new Promise((r) => setTimeout(r, 600));
      const user = {
        id: 'user_' + Date.now(),
        email: formData.email,
        name: formData.name,
        accessToken: 'mock_access_token_' + Math.random().toString(36).slice(2),
      };
      onLogin(user);
      onClose();
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate local sign-in without Supabase
      await new Promise((r) => setTimeout(r, 500));
      const user = {
        id: 'user_' + Math.random().toString(36).slice(2),
        email: formData.email,
        name: formData.email,
        accessToken: 'mock_access_token_' + Math.random().toString(36).slice(2),
      };
      onLogin(user);
      onClose();
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
