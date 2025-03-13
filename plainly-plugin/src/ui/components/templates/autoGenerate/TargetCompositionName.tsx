import { useGetProjectMetadata } from '@src/ui/hooks';
import type { CompositionAeItem } from '@src/ui/types/metadata';
import { collectCompositions, compositionSorter } from '@src/ui/utils';
import { useContext, useMemo } from 'react';
import { Select } from '../../common';
import { AuthContext } from '../../settings';
import { Label } from '../../typography';

export function TargetCompositionName({
  targetCompositionName,
  setTargetCompositionName,
  projectId,
}: {
  targetCompositionName: string | undefined;
  setTargetCompositionName: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  projectId: string;
}) {
  const { apiKey } = useContext(AuthContext);
  const { isLoading, data: meta } = useGetProjectMetadata(
    apiKey,
    projectId,
    true,
    true,
  );
  const compositions = useMemo(() => {
    const result: CompositionAeItem[] = [];

    if (meta) {
      for (const comp of meta.sort(compositionSorter)) {
        for (const c of collectCompositions(comp)) {
          if (result.findIndex((existing) => existing.id === c.id) < 0) {
            result.push(c);
          }
        }
      }
    }

    return result;
  }, [meta]);

  const data = useMemo(
    () =>
      compositions.map((c) => ({
        id: c.id,
        name: c.name,
        item: c,
        label: c.name,
        selected: c.name === targetCompositionName,
      })),
    [compositions, targetCompositionName],
  );

  return (
    <div className="col-span-full">
      <Label label="Target composition" htmlFor="targetCompositionName" />
      <Select data={data} onChange={setTargetCompositionName} />
    </div>
  );
}
