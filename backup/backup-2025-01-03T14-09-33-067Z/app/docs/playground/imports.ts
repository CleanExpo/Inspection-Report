import React, { useState } from 'react';
import { TemplateSelector } from '@/app/components/MoistureMappingSystem/TemplateSelector';
import { ComparisonView } from '@/app/components/MoistureMappingSystem/ComparisonView';
import { HistoryView } from '@/app/components/MoistureMappingSystem/HistoryView';
import { exportMeasurementHistory } from '@/app/components/MoistureMappingSystem/exportUtils';
import { MeasurementTemplate, MeasurementHistory, Point } from '@/app/components/MoistureMappingSystem/types';
