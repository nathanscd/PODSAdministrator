import React from 'react';
import {
  Globe,
  Briefcase,
  BarChart3,
  FileText,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SmartCombobox } from './SmartCombobox';
import { Opportunity } from '../../types';

import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface SectionProps {
  formData: Opportunity;
  handleChange: (field: keyof Opportunity, value: any) => void;
  handleNumberChange?: (field: keyof Opportunity, val: string) => void;
  optionsMap: Record<string, string[]>;
  addOption: (key: string, val: string) => void;
  removeOption: (key: string, val: string) => void;
  renameOption: (key: string, oldVal: string, newVal: string) => void;
  isAdmin?: boolean;
}

export function FormGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground group-focus-within:text-foreground transition-colors">
        {label}
      </label>
      {children}
    </div>
  );
}

export const BasicInfoSection: React.FC<SectionProps> = ({
  formData,
  handleChange,
  optionsMap,
  addOption,
  removeOption,
  renameOption,
  isAdmin,
}) => (
  <Card className="bg-card border-border/60 shadow-sm rounded-2xl">
    <CardHeader className="flex flex-row items-center gap-2.5 pb-4 border-b border-border/50">
      <Globe size={18} className="text-muted-foreground" />
      <CardTitle className="text-sm font-semibold tracking-tight">Basic Information</CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <FormGroup label="Technical Sales Group">
          <SmartCombobox
            fieldKey="technicalSalesGroup"
            label="Technical Sales Group"
            value={formData.technicalSalesGroup || ''}
            options={[
              '1st Group',
              '2nd Group',
              '3rd Group',
              ...(optionsMap['technicalSalesGroup'] || []),
            ]}
            onChange={(val) => handleChange('technicalSalesGroup', val)}
            onAddOption={(val) => addOption('technicalSalesGroup', val)}
            onRemoveOption={(val) => removeOption('technicalSalesGroup', val)}
            onRenameOption={(oldVal, newVal) => renameOption('technicalSalesGroup', oldVal, newVal)}
            disabled={!isAdmin}
          />
        </FormGroup>

        <FormGroup label="KAM (Key Account Manager)">
          <SmartCombobox
            fieldKey="kam"
            label="KAM"
            value={formData.kam || ''}
            options={optionsMap['kam'] || []}
            onChange={(val) => handleChange('kam', val)}
            onAddOption={(val) => addOption('kam', val)}
            onRemoveOption={(val) => removeOption('kam', val)}
            onRenameOption={(oldVal, newVal) => renameOption('kam', oldVal, newVal)}
          />
        </FormGroup>

        <FormGroup label="Opportunity Status">
          <SmartCombobox
            fieldKey="status"
            label="Status"
            value={formData.status || ''}
            options={optionsMap['status'] || []}
            onChange={(val) => handleChange('status', val)}
            onAddOption={(val) => addOption('status', val)}
            onRemoveOption={(val) => removeOption('status', val)}
            onRenameOption={(oldVal, newVal) => renameOption('status', oldVal, newVal)}
          />
        </FormGroup>

        <FormGroup label="Business Stages">
          <SmartCombobox
            fieldKey="businessStages"
            label="Business Stages"
            value={formData.businessStages || ''}
            options={optionsMap['businessStages'] || []}
            onChange={(val) => handleChange('businessStages', val)}
            onAddOption={(val) => addOption('businessStages', val)}
            onRemoveOption={(val) => removeOption('businessStages', val)}
            onRenameOption={(oldVal, newVal) => renameOption('businessStages', oldVal, newVal)}
          />
        </FormGroup>

        <FormGroup label="Priority">
          <Select
            value={formData.priority || 'Medium'}
            onValueChange={(val) => handleChange('priority', val)}
          >
            <SelectTrigger className="w-full h-9 text-xs font-medium">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </FormGroup>

        <FormGroup label="Utility">
          <SmartCombobox
            fieldKey="utility"
            label="Utility"
            value={formData.utility || ''}
            options={optionsMap['utility'] || []}
            onChange={(val) => handleChange('utility', val)}
            onAddOption={(val) => addOption('utility', val)}
            onRemoveOption={(val) => removeOption('utility', val)}
            onRenameOption={(oldVal, newVal) => renameOption('utility', oldVal, newVal)}
          />
        </FormGroup>

        <FormGroup label="Last Discussion">
          <Input
            type="date"
            className="h-9 text-xs [color-scheme:dark]"
            value={formData.lastCustomerDiscussion || ''}
            onChange={(e) => handleChange('lastCustomerDiscussion', e.target.value)}
          />
        </FormGroup>
      </div>
    </CardContent>
  </Card>
);

export const SpecsSection: React.FC<SectionProps> = ({
  formData,
  handleChange,
  optionsMap,
  addOption,
  removeOption,
  renameOption,
}) => (
  <Card className="bg-card border-border/60 shadow-sm rounded-2xl">
    <CardHeader className="flex flex-row items-center gap-2.5 pb-4 border-b border-border/50">
      <Briefcase size={18} className="text-muted-foreground" />
      <CardTitle className="text-sm font-semibold tracking-tight">Specifications</CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {[
          { label: 'Product', key: 'product' },
          { label: 'Product Team', key: 'productTeam' },
          { label: 'Ecosystem', key: 'ecosystem' },
          { label: 'Competitors', key: 'competitors' },
          { label: 'Country', key: 'country' },
          { label: 'HQ Support', key: 'hqInterface' },
          { label: 'Sales Management', key: 'salesManagement' },
        ].map((field) => (
          <FormGroup key={field.key} label={field.label}>
            <SmartCombobox
              fieldKey={field.key}
              label={field.label}
              value={(formData as any)[field.key] || ''}
              options={optionsMap[field.key] || []}
              onChange={(val) => handleChange(field.key as keyof Opportunity, val)}
              onAddOption={(val) => addOption(field.key, val)}
              onRemoveOption={(val) => removeOption(field.key, val)}
              onRenameOption={(oldVal, newVal) => renameOption(field.key, oldVal, newVal)}
            />
          </FormGroup>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const MetricsSection: React.FC<SectionProps> = ({
  formData,
  handleChange,
  handleNumberChange,
  optionsMap,
  addOption,
  removeOption,
  renameOption,
}) => (
  <Card className="bg-card border-border/60 shadow-sm rounded-2xl">
    <CardHeader className="flex flex-row items-center gap-2.5 pb-4 border-b border-border/50">
      <BarChart3 size={18} className="text-muted-foreground" />
      <CardTitle className="text-sm font-semibold tracking-tight">Metrics</CardTitle>
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormGroup label="Start Year">
          <Input
            type="number"
            className="h-9 text-xs"
            value={formData.yearStart || ''}
            placeholder="Ex: 2024"
            onChange={(e) => handleNumberChange!('yearStart', e.target.value)}
          />
        </FormGroup>
        <FormGroup label="End Year">
          <Input
            type="number"
            className="h-9 text-xs"
            value={formData.yearEnd || ''}
            placeholder="Ex: 2025"
            onChange={(e) => handleNumberChange!('yearEnd', e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Quantity">
          <Input
            type="number"
            className="h-9 text-xs"
            value={formData.quantity || ''}
            placeholder="0"
            onChange={(e) => handleNumberChange!('quantity', e.target.value)}
          />
        </FormGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <FormGroup label="SCP (ID)">
          <Input
            type="text"
            className="h-9 text-xs"
            value={formData.scp || ''}
            placeholder="Enter SCP ID"
            onChange={(e) => handleChange('scp', e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Progress (%)">
          <div className="flex items-center gap-4 bg-background border border-input px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-ring transition-all h-9">
            <Input
              type="number"
              className="w-12 bg-transparent border-none shadow-none outline-none text-xs font-medium text-center p-0 h-auto focus-visible:ring-0"
              value={formData.progress || ''}
              placeholder="0"
              onChange={(e) => handleNumberChange!('progress', e.target.value)}
            />
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border border-border/40">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, formData.progress || 0))}%`,
                }}
              />
            </div>
          </div>
        </FormGroup>
        <div className="md:col-span-2">
          <FormGroup label="Win/Loss Reason">
            <SmartCombobox
              fieldKey="reasonWinLoss"
              label="Win/Loss Reason"
              value={formData.reasonWinLoss || ''}
              options={[
                'Technical',
                'Commercial',
                'Client Withdraw',
                'Eletra Withdraw',
                ...(optionsMap['reasonWinLoss'] || []),
              ]}
              onChange={(val) => handleChange('reasonWinLoss', val)}
              onAddOption={(val) => addOption('reasonWinLoss', val)}
              onRemoveOption={(val) => removeOption('reasonWinLoss', val)}
              onRenameOption={(oldVal, newVal) => renameOption('reasonWinLoss', oldVal, newVal)}
            />
          </FormGroup>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const AdditionalInfoSection: React.FC<SectionProps> = ({
  formData,
  handleChange,
}) => (
  <Card className="bg-card border-border/60 shadow-sm rounded-2xl">
    <CardHeader className="flex flex-row items-center gap-2.5 pb-4 border-b border-border/50">
      <FileText size={18} className="text-muted-foreground" />
      <CardTitle className="text-sm font-semibold tracking-tight">Additional Information</CardTitle>
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      <FormGroup label="SharePoint Files">
        <div className="flex gap-2 w-full">
          <Input
            className="h-9 text-xs flex-1"
            value={formData.files || ''}
            placeholder="https://company.sharepoint.com/..."
            onChange={(e) => handleChange('files', e.target.value)}
          />
          {formData.files && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              type="button"
              onClick={() => window.open(formData.files, '_blank', 'noreferrer')}
            >
              <ExternalLink size={14} />
            </Button>
          )}
        </div>
      </FormGroup>

      <div className="bg-muted/40 border border-border/60 p-4 rounded-xl flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex items-center gap-3">
          <Checkbox
            id="homologated-checkbox"
            checked={formData.homologated || false}
            onCheckedChange={(checked) => handleChange('homologated', !!checked)}
            className="h-4 w-4 rounded-[4px]"
          />
          <label htmlFor="homologated-checkbox" className="text-xs font-medium text-foreground cursor-pointer">
            Homologated Product
          </label>
        </div>

        <div className="w-px h-4 bg-border hidden md:block" />

        <Input
          placeholder="Homologation details or justification..."
          className="flex-1 bg-transparent border-none shadow-none h-auto p-0 text-xs focus-visible:ring-0 placeholder:text-muted-foreground/50"
          value={formData.reasonHomologated || ''}
          onChange={(e) => handleChange('reasonHomologated', e.target.value)}
        />
      </div>

      <FormGroup label="General Observations">
        <Textarea
          className="min-h-[120px] text-xs resize-none leading-relaxed custom-scrollbar"
          value={formData.observation || ''}
          placeholder="Write details of the last discussion, notes, or project observations..."
          onChange={(e) => handleChange('observation', e.target.value)}
        />
      </FormGroup>

      {(formData.businessStages === 'RFI' || formData.businessStages === 'RFP') && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-500">
              Attention: Critical Process (RFI/RFP)
            </p>
            <Input
              className="bg-transparent border-none shadow-none h-auto p-0 text-xs text-foreground focus-visible:ring-0 placeholder:text-amber-500/40 font-medium"
              placeholder="Add an urgent reminder or attention note here..."
              value={formData.remember || ''}
              onChange={(e) => handleChange('remember', e.target.value)}
            />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);