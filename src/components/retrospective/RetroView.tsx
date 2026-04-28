'use client';

import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Retrospective, RetroStage, STAGE_COLORS } from './types';
import { dummyRetros } from './dummyData';
import RetroDetail from './RetroDetail';
import WriteRetroModal from './WriteRetroModal';
import styles from './RetroView.module.scss';

type FilterTab = '전체' | RetroStage;
const TABS: FilterTab[] = ['전체', '서류', '코테', '면접', '최종'];

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function RetroView() {
  const [retros, setRetros] = useState<Retrospective[]>(dummyRetros);
  const [activeTab, setActiveTab] = useState<FilterTab>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingRetro, setEditingRetro] = useState<Retrospective | undefined>(undefined);

  const filteredRetros = useMemo(() => {
    return retros.filter((r) => {
      const matchStage = activeTab === '전체' || r.stage === activeTab;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.company.toLowerCase().includes(q) ||
        r.position.toLowerCase().includes(q) ||
        r.question.toLowerCase().includes(q) ||
        r.answer.toLowerCase().includes(q);
      return matchStage && matchSearch;
    });
  }, [retros, activeTab, searchQuery]);

  const selectedRetro = retros.find((r) => r.id === selectedId) ?? null;

  function handleSave(data: Omit<Retrospective, 'id'>) {
    if (editingRetro) {
      setRetros((prev) =>
        prev.map((r) => (r.id === editingRetro.id ? { ...data, id: editingRetro.id } : r))
      );
    } else {
      const newRetro = { ...data, id: String(Date.now()) };
      setRetros((prev) => [newRetro, ...prev]);
      setSelectedId(newRetro.id);
    }
    setEditingRetro(undefined);
  }

  function handleDelete(id: string) {
    setRetros((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function openEdit(retro: Retrospective) {
    setEditingRetro(retro);
    setShowWriteModal(true);
  }

  function openWrite() {
    setEditingRetro(undefined);
    setShowWriteModal(true);
  }

  return (
    <div className={styles.wrapper}>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>회고</h1>
          <p className={styles.pageSubtitle}>면접과 과제에 대한 회고를 기록하세요</p>
        </div>
        <button className={styles.writeBtn} onClick={openWrite}>
          <Plus size={15} />
          회고 작성
        </button>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        {/* Left: List Panel */}
        <div className={styles.listPanel}>
          {/* Filter Tabs */}
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="회사명, 포지션, 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* List */}
          <div className={styles.list}>
            {filteredRetros.length === 0 ? (
              <p className={styles.emptyList}>검색 결과가 없습니다.</p>
            ) : (
              filteredRetros.map((retro) => {
                const stageColor = STAGE_COLORS[retro.stage];
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
                        style={{ background: stageColor.bg, color: stageColor.text }}
                      >
                        {retro.stage}
                      </span>
                    </div>
                    <p className={styles.listPosition}>{retro.position}</p>
                    <p className={styles.listDate}>{formatDateShort(retro.date)}</p>
                    {retro.question && (
                      <p className={styles.listPreview}>{retro.question}</p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className={styles.detailPanel}>
          <RetroDetail
            retro={selectedRetro}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* ── Write Modal ── */}
      {showWriteModal && (
        <WriteRetroModal
          initial={editingRetro}
          onClose={() => { setShowWriteModal(false); setEditingRetro(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
