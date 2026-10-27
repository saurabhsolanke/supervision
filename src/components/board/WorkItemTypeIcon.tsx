import React from 'react';
import { WorkItemType } from '@/types';
import { BookOpen, CheckSquare, Bug, Trophy, Crown } from 'lucide-react';
import { WORK_ITEM_TYPE_CONFIG } from '@/lib/constants';

interface WorkItemTypeIconProps {
  type: WorkItemType;
  className?: string;
  size?: number;
}

export function WorkItemTypeIcon({ type, className = '', size = 16 }: WorkItemTypeIconProps) {
  const config = WORK_ITEM_TYPE_CONFIG[type];

  const getIcon = () => {
    switch (type) {
      case 'USER_STORY':
        return <BookOpen size={size} style={{ color: config.color }} className={className} />;
      case 'TASK':
        return <CheckSquare size={size} style={{ color: config.color }} className={className} />;
      case 'BUG':
        return <Bug size={size} style={{ color: config.color }} className={className} />;
      case 'FEATURE':
        return <Trophy size={size} style={{ color: config.color }} className={className} />;
      case 'EPIC':
        return <Crown size={size} style={{ color: config.color }} className={className} />;
      default:
        return <BookOpen size={size} style={{ color: config.color }} className={className} />;
    }
  };

  return getIcon();
}
