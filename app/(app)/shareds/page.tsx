"use client";

import * as React from "react";

type PaletteItem = {
  type: string; // ドロップ時に追加する“種類”を識別
  label: string; // UI表示
};

type AddedItem = {
  id: string; // 追加された項目の一意ID
  type: string; // どの種類から追加されたか
  label: string; // 表示名
};

const PALETTE: PaletteItem[] = [
  { type: "task", label: "タスク" },
  { type: "note", label: "ノート" },
  { type: "bug", label: "バグ" },
];

function uid() {
  // ここは好みで nanoid / uuid に置き換えOK
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function Page() {
  // ====== 追加される項目の状態（Dropすると増える） ======
  const [items, setItems] = React.useState<AddedItem[]>([]);
  const [isOver, setIsOver] = React.useState(false); // ドロップゾーン上にいるか（見た目用）

  // ====== ドロップされたときに “追加” する中核ロジック ======
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);

    // (A) DragStartで入れたデータを取り出す
    const type = e.dataTransfer.getData("application/x-palette-type");
    if (!type) return; // 想定外のドロップは無視

    // (B) “項目を追加する” (ここがテンプレの本体)
    const palette = PALETTE.find((p) => p.type === type);
    const label = palette ? palette.label : type;

    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        type,
        label,
      },
    ]);
  };

  // ====== DragOver を preventDefault しないと drop が発火しない ======
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // これがないと drop できない（重要）
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  // ====== パレット側：ドラッグ開始時に DataTransfer に “種類” を載せる ======
  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    type: string,
  ) => {
    // (C) ドロップ先が読むためのデータを詰める
    e.dataTransfer.setData("application/x-palette-type", type);
    e.dataTransfer.effectAllowed = "copy"; // “追加”なので copy が自然
  };

  // ====== 追加された項目の削除（おまけ） ======
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>ドラッグ&ドロップで「項目を追加」テンプレ</h1>
        <p style={styles.desc}>
          左のパレットをドラッグして、右のドロップゾーンに落とすと項目が追加されます。
        </p>
      </header>

      <section style={styles.grid}>
        {/* ====== (1) 追加元（パレット） ====== */}
        <aside style={styles.panel}>
          <h2 style={styles.h2}>パレット（ドラッグ元）</h2>
          <div style={styles.palette}>
            {PALETTE.map((p) => (
              <button
                key={p.type}
                style={styles.paletteItem}
                draggable
                onDragStart={(e) => handleDragStart(e, p.type)}
                title="ドラッグして右にドロップ"
              >
                + {p.label}
              </button>
            ))}
          </div>

          <div style={styles.note}>
            <div style={styles.noteTitle}>対応箇所</div>
            <ul style={styles.ul}>
              <li>
                <code>draggable</code>：要素をドラッグ可能にする
              </li>
              <li>
                <code>onDragStart</code>：<code>dataTransfer.setData</code> で
                type を渡す
              </li>
            </ul>
          </div>
        </aside>

        {/* ====== (2) 追加先（ドロップゾーン） ====== */}
        <section style={styles.panel}>
          <h2 style={styles.h2}>ドロップゾーン（追加先）</h2>

          <div
            style={{
              ...styles.dropzone,
              ...(isOver ? styles.dropzoneOver : null),
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            {items.length === 0 ? (
              <div style={styles.empty}>
                ここにドロップすると項目が追加されます
              </div>
            ) : (
              <ul style={styles.list}>
                {items.map((item) => (
                  <li key={item.id} style={styles.listItem}>
                    <div>
                      <div style={styles.itemLabel}>{item.label}</div>
                      <div style={styles.itemMeta}>type: {item.type}</div>
                    </div>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => removeItem(item.id)}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={styles.note}>
            <div style={styles.noteTitle}>対応箇所</div>
            <ul style={styles.ul}>
              <li>
                <code>onDragOver</code> で <code>e.preventDefault()</code>
                ：これがないと drop できない
              </li>
              <li>
                <code>onDrop</code>：<code>dataTransfer.getData</code> を読む
              </li>
              <li>
                <code>setItems</code>：ここで「追加」している（本体）
              </li>
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}

// ====== 最小のインラインスタイル（TailwindでもOK） ======
const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 980,
    margin: "0 auto",
    padding: 24,
    display: "grid",
    gap: 16,
  },
  header: { display: "grid", gap: 6 },
  title: { fontSize: 20, margin: 0 },
  desc: { margin: 0, opacity: 0.8 },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 16,
    alignItems: "start",
  },

  panel: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 16,
    background: "white",
    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  },
  h2: { fontSize: 16, margin: "0 0 12px 0" },

  palette: { display: "grid", gap: 10 },
  paletteItem: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fafafa",
    cursor: "grab",
    textAlign: "left",
  },

  dropzone: {
    minHeight: 280,
    borderRadius: 12,

    // ✅ border を分解（常に同じキーを使う）
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#cfcfcf",

    padding: 12,
    display: "grid",
    alignContent: "start",
  },
  dropzoneOver: {
    // ✅ 同じキー（borderColor）だけ変更
    borderColor: "#999",
    background: "#fcfcfc",
  },
  empty: { opacity: 0.7, padding: 16 },

  list: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 },
  listItem: {
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  itemLabel: { fontWeight: 600 },
  itemMeta: { fontSize: 12, opacity: 0.7 },

  deleteBtn: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: "8px 10px",
    background: "white",
    cursor: "pointer",
  },

  note: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #eee",
    background: "#fafafa",
    fontSize: 13,
  },
  noteTitle: { fontWeight: 700, marginBottom: 6 },
  ul: { margin: 0, paddingLeft: 18, display: "grid", gap: 4 },
};
