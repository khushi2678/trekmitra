import { levelLabels } from '@/lib/format';
import type { Level } from '@/types/trek';

const styles: Record<Level, string> = {
    beginner: 'bg-level-beginner-bg text-level-beginner',
    intermediate: 'bg-level-intermediate-bg text-level-intermediate',
    expert: 'bg-level-expert-bg text-level-expert',
};

export default function LevelBadge({ level }: { level: Level }) {
    return (
        <span className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ${styles[level]}`}>
            {levelLabels[level]}
        </span>
    );
}
