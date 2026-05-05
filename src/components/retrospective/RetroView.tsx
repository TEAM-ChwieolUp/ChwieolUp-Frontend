'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { KanbanStage } from '@/components/kanban/types';
import { ApiError } from '@/lib/api';
import { listApplications } from '@/features/kanban/api/applications';
import { listStages } from '@/features/kanban/api/stages';
import {
  addRetrospectiveItem,
  applyRetrospectiveTemplate,
  createApplicationRetrospective,
  deleteRetrospective,
  deleteRetrospectiveItem,
  generateAiRetrospectiveQuestions,
  getRetrospective,
  listApplicationRetrospectives,
  listRetrospectiveTemplates,
  retrospectiveKeys,
  updateRetrospectiveItem,
} from '@/features/retrospective/api/retrospectives';
import RetroDetail from './RetroDetail';
import {
  OVERALL_STAGE_COLOR,
  OVERALL_STAGE_NAME,
  RetrospectiveDetail,
  RetrospectiveEditorForm,
  RetrospectiveItem,
  RetrospectiveSummary,
} from './types';
import WriteRetroModal from './WriteRetroModal';
import styles from './RetroView.module.scss';

type FilterTab = '전체' | typeof OVERALL_STAGE_NAME | string;

function formatDateShort(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function mapSummaryWithContext(
  summary: {
    id: string;
    applicationId: string;
    stageId: string | null;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
  },
  applications: Awaited<ReturnType<typeof listApplications>>['cards'],
  stages: KanbanStage[]
): RetrospectiveSummary | null {
  const application = applications.find((card) => card.id === summary.applicationId);

  if (!application) {
    return null;
  }

  const stage = summary.stageId
    ? stages.find((entry) => entry.id === summary.stageId)
    : null;

  return {
    id: summary.id,
    applicationId: summary.applicationId,
    stageId: summary.stageId,
    itemCount: summary.itemCount,
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
    company: application.company,
    position: application.position,
    stageName: stage?.name ?? OVERALL_STAGE_NAME,
    stageColor: stage?.color ?? OVERALL_STAGE_COLOR,
    isOverall: !summary.stageId,
  };
}

function mapDetailWithContext(
  detail: Awaited<ReturnType<typeof getRetrospective>>,
  summaries: RetrospectiveSummary[]
): RetrospectiveDetail | null {
  const summary = summaries.find((entry) => entry.id === detail.id);

  if (!summary) {
    return null;
  }

  return {
    ...summary,
    items: detail.items,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };
}

function areItemsEqual(left: RetrospectiveItem, right: RetrospectiveItem) {
  return left.question === right.question && left.answer === right.answer;
}

export default function RetroView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingRetroId, setEditingRetroId] = useState<string | null>(null);

  const { data: boardData } = useQuery({
    queryKey: ['retrospectives', 'board-context'],
    queryFn: () => listApplications(),
  });

  const { data: stages = [] } = useQuery({
    queryKey: ['retrospectives', 'stages'],
    queryFn: listStages,
  });

  const { data: templates = [] } = useQuery({
    queryKey: retrospectiveKeys.templates,
    queryFn: listRetrospectiveTemplates,
  });

  const applications = boardData?.cards ?? [];

  const { data: retrospectiveSummaries = [], isLoading } = useQuery({
    queryKey: [...retrospectiveKeys.all, 'aggregated', applications.map((app) => app.id)],
    queryFn: async () => {
      const retrospectives = await Promise.all(
        applications.map((application) =>
          listApplicationRetrospectives(application.id).then((entries) =>
            entries.map((entry) => mapSummaryWithContext(entry, applications, stages))
          )
        )
      );

      return retrospectives
        .flat()
        .filter((entry): entry is RetrospectiveSummary => entry !== null)
        .sort(
          (left: RetrospectiveSummary, right: RetrospectiveSummary) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        );
    },
    enabled: applications.length > 0 && stages.length > 0,
  });

  const { data: selectedRetroDetail } = useQuery({
    queryKey: selectedId ? retrospectiveKeys.detail(selectedId) : ['retrospectives', 'detail', 'idle'],
    queryFn: async () => {
      const detail = await getRetrospective(selectedId!);
      return mapDetailWithContext(detail, retrospectiveSummaries);
    },
    enabled: Boolean(selectedId),
  });

  const { data: editingRetroDetail } = useQuery({
    queryKey: editingRetroId
      ? retrospectiveKeys.detail(editingRetroId)
      : ['retrospectives', 'editing', 'idle'],
    queryFn: async () => {
      const detail = await getRetrospective(editingRetroId!);
      return mapDetailWithContext(detail, retrospectiveSummaries);
    },
    enabled: Boolean(editingRetroId),
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      form,
      retrospectiveId,
    }: {
      form: RetrospectiveEditorForm;
      retrospectiveId?: string;
    }) => {
      if (!retrospectiveId) {
        const created = await createApplicationRetrospective(form.applicationId, {
          stageId: form.stageId || null,
        });

        let items = created.items;

        for (const item of form.items) {
          const added = await addRetrospectiveItem(created.id, {
            question: item.question,
            answer: item.answer,
          });
          items = added.items;
        }

        return {
          retrospectiveId: created.id,
          items,
        };
      }

      const current = await getRetrospective(retrospectiveId);
      const desiredItems = form.items;
      const overlap = Math.min(current.items.length, desiredItems.length);

      for (let index = current.items.length - 1; index >= desiredItems.length; index -= 1) {
        await deleteRetrospectiveItem(retrospectiveId, index);
      }

      for (let index = 0; index < overlap; index += 1) {
        if (!areItemsEqual(current.items[index], desiredItems[index])) {
          await updateRetrospectiveItem(retrospectiveId, index, desiredItems[index]);
        }
      }

      for (let index = current.items.length; index < desiredItems.length; index += 1) {
        await addRetrospectiveItem(retrospectiveId, desiredItems[index]);
      }

      return {
        retrospectiveId,
        items: desiredItems,
      };
    },
    onSuccess: async ({ retrospectiveId }) => {
      await queryClient.invalidateQueries({ queryKey: retrospectiveKeys.all });
      await queryClient.invalidateQueries({ queryKey: retrospectiveKeys.detail(retrospectiveId) });
      setSelectedId(retrospectiveId);
      setEditingRetroId(null);
      setShowWriteModal(false);
    },
    onError: (error) => {
      window.alert(
        getApiErrorMessage(error, '회고 저장 중 오류가 발생했습니다.')
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRetrospective,
    onSuccess: async (_, retrospectiveId) => {
      await queryClient.invalidateQueries({ queryKey: retrospectiveKeys.all });
      await queryClient.removeQueries({ queryKey: retrospectiveKeys.detail(retrospectiveId) });
      if (selectedId === retrospectiveId) {
        setSelectedId(null);
      }
      if (editingRetroId === retrospectiveId) {
        setEditingRetroId(null);
        setShowWriteModal(false);
      }
    },
    onError: (error) => {
      window.alert(
        getApiErrorMessage(error, '회고 삭제 중 오류가 발생했습니다.')
      );
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: ({
      retrospectiveId,
      templateId,
    }: {
      retrospectiveId: string;
      templateId: string;
    }) => applyRetrospectiveTemplate(retrospectiveId, templateId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: retrospectiveKeys.all });
      await queryClient.invalidateQueries({
        queryKey: retrospectiveKeys.detail(variables.retrospectiveId),
      });
    },
  });

  const stageTabs = useMemo(() => {
    const dynamicTabs = Array.from(
      new Set(retrospectiveSummaries.map((retro) => retro.stageName))
    );

    return ['전체', ...dynamicTabs] as FilterTab[];
  }, [retrospectiveSummaries]);

  const filteredRetros = useMemo(() => {
    const lowerQuery = searchQuery.trim().toLowerCase();

    return retrospectiveSummaries.filter((retro) => {
      const matchStage =
        activeTab === '전체' || retro.stageName === activeTab;
      const matchSearch =
        !lowerQuery ||
        retro.company.toLowerCase().includes(lowerQuery) ||
        retro.position.toLowerCase().includes(lowerQuery);

      return matchStage && matchSearch;
    });
  }, [activeTab, retrospectiveSummaries, searchQuery]);

  const selectedDisplayRetro = selectedRetroDetail ?? null;

  async function handleSave(form: RetrospectiveEditorForm, retrospectiveId?: string) {
    const normalizedItems = form.items
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question);

    await saveMutation.mutateAsync({
      form: {
        ...form,
        items: normalizedItems,
      },
      retrospectiveId,
    });
  }

  async function handleDelete(id: string) {
    const target = retrospectiveSummaries.find((retro) => retro.id === id);

    if (!target) {
      return;
    }

    const shouldDelete = window.confirm(`"${target.company}" 회고를 삭제할까요?`);

    if (!shouldDelete) {
      return;
    }

    await deleteMutation.mutateAsync(id);
  }

  function openEdit(retro: RetrospectiveDetail) {
    setEditingRetroId(retro.id);
    setShowWriteModal(true);
  }

  function openWrite() {
    setEditingRetroId(null);
    setShowWriteModal(true);
  }

  async function handleGenerateAiQuestions(applicationId: string, stageId?: string) {
    try {
      return await generateAiRetrospectiveQuestions({
        applicationId,
        stageId: stageId || undefined,
      });
    } catch (error) {
      window.alert(
        getApiErrorMessage(error, 'AI 질문 생성 중 오류가 발생했습니다.')
      );
      throw error;
    }
  }

  async function handleApplyTemplate(retrospectiveId: string, templateId: string) {
    try {
      const detail = await applyTemplateMutation.mutateAsync({
        retrospectiveId,
        templateId,
      });

      return detail.items;
    } catch (error) {
      window.alert(
        getApiErrorMessage(error, '템플릿 적용 중 오류가 발생했습니다.')
      );
      throw error;
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>회고</h1>
          <p className={styles.pageSubtitle}>지원 카드별 질문과 답변을 회고로 남겨보세요</p>
        </div>
        <button className={styles.writeBtn} onClick={openWrite}>
          <Plus size={15} />
          회고 작성
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.listPanel}>
          <div className={styles.tabs}>
            {stageTabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="회사명 또는 포지션 검색..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className={styles.list}>
            {isLoading ? (
              <p className={styles.emptyList}>회고를 불러오는 중입니다.</p>
            ) : filteredRetros.length === 0 ? (
              <p className={styles.emptyList}>검색 결과가 없습니다.</p>
            ) : (
              filteredRetros.map((retro) => {
                const isSelected = selectedId === retro.id;

                return (
                  <button
                    key={retro.id}
                    className={`${styles.listItem} ${isSelected ? styles.listItemActive : ''}`}
                    onClick={() => setSelectedId(retro.id)}
                  >
                    <div className={styles.listItemHeader}>
                      <span className={styles.listCompany}>{retro.company}</span>
                      <span
                        className={styles.listStageBadge}
                        style={{
                          background: `${retro.stageColor}22`,
                          color: retro.stageColor,
                        }}
                      >
                        {retro.stageName}
                      </span>
                    </div>
                    <p className={styles.listPosition}>{retro.position}</p>
                    <p className={styles.listDate}>{formatDateShort(retro.updatedAt)}</p>
                    <p className={styles.listPreview}>문항 {retro.itemCount}개</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.detailPanel}>
          <RetroDetail
            retro={selectedDisplayRetro}
            onEdit={openEdit}
            onDelete={(id) => void handleDelete(id)}
          />
        </div>
      </div>

      {showWriteModal && (
        <WriteRetroModal
          initial={editingRetroDetail ?? undefined}
          applications={applications.map((application) => ({
            id: application.id,
            company: application.company,
            position: application.position,
          }))}
          stages={stages}
          templates={templates}
          isSaving={saveMutation.isPending}
          onClose={() => {
            setShowWriteModal(false);
            setEditingRetroId(null);
          }}
          onSave={handleSave}
          onApplyTemplate={handleApplyTemplate}
          onGenerateAiQuestions={handleGenerateAiQuestions}
        />
      )}
    </div>
  );
}
