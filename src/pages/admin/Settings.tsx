
import React from 'react';
import SettingsManager from '@/components/admin/SettingsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-border/30 bg-black/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Restaurant Settings</CardTitle>
          <CardDescription>
            Configure your restaurant's information, contact details, and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
