import { MainLayout } from '@/components/layout/MainLayout';
import { Settings as SettingsIcon, Bell, Palette, Database, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Settings() {
  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your app preferences
          </p>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Notifications</h2>
              <p className="text-sm text-muted-foreground">Configure reminder settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive deadline reminders via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>24 Hour Reminder</Label>
                <p className="text-sm text-muted-foreground">Get notified 24 hours before deadline</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>6 Hour Reminder</Label>
                <p className="text-sm text-muted-foreground">Get notified 6 hours before deadline</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>1 Hour Reminder</Label>
                <p className="text-sm text-muted-foreground">Get urgent reminder 1 hour before</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Data Management</h2>
              <p className="text-sm text-muted-foreground">Export or clear your data</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
              </div>
              <Button variant="outline">Export</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Clear All Data</Label>
                <p className="text-sm text-muted-foreground">Remove all hackathons and quizzes</p>
              </div>
              <Button variant="destructive">Clear</Button>
            </div>
          </div>
        </div>

        {/* Backend Connection */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">Backend Connection</h2>
              <p className="text-sm text-muted-foreground">Connect to cloud database</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Currently using local storage. Connect to Lovable Cloud for:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Database persistence</li>
              <li>• Email reminders</li>
              <li>• Cross-device sync</li>
              <li>• File storage for certificates</li>
            </ul>
            <Button className="gradient-primary">Connect Cloud Backend</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
