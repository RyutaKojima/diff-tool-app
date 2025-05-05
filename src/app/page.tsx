'use client';

import { useState, useRef } from 'react';
import { diffLines, Change } from 'diff';
import Image from "next/image";

// スクロール同期用のカスタムフック
const useScrollSync = () => {
  const refs = {
    original: useRef<HTMLDivElement>(null),
    modified: useRef<HTMLDivElement>(null),
    diff: useRef<HTMLDivElement>(null),
  };

  const handleScroll = (sourceRef: React.RefObject<HTMLDivElement | null>) => {
    if (!sourceRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = sourceRef.current;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

    Object.values(refs).forEach((ref) => {
      if (ref !== sourceRef && ref.current) {
        const targetScrollTop = scrollPercentage * (ref.current.scrollHeight - ref.current.clientHeight);
        ref.current.scrollTop = targetScrollTop;
      }
    });
  };

  return { refs, handleScroll };
};

export default function Home() {
  const [file1, setFile1] = useState<string>('');
  const [file2, setFile2] = useState<string>('');
  const [diffResult, setDiffResult] = useState<Change[]>([]);
  const { refs, handleScroll } = useScrollSync();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileNumber: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    if (fileNumber === 1) {
      setFile1(text);
    } else {
      setFile2(text);
    }
  };

  const compareFiles = () => {
    if (!file1 || !file2) return;
    const diff = diffLines(file1, file2);
    setDiffResult(diff);
  };

  const renderFileContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className="font-mono text-sm text-gray-800 leading-relaxed">
        {line}
      </div>
    ));
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">ファイル比較ツール</h1>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">ファイル1</h2>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, 1)}
              className="block w-full text-sm text-gray-700
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">ファイル2</h2>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, 2)}
              className="block w-full text-sm text-gray-700
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
        </div>

        <button
          onClick={compareFiles}
          disabled={!file1 || !file2}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed mb-8 hover:bg-blue-700 transition-colors"
        >
          比較する
        </button>

        {diffResult.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">比較結果</h2>
            <div className="grid grid-cols-3 gap-4">
              {/* 元のファイル */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">元のファイル</h3>
                <div 
                  ref={refs.original}
                  onScroll={() => handleScroll(refs.original)}
                  className="overflow-auto max-h-[600px] bg-gray-50 rounded p-2"
                >
                  {renderFileContent(file1)}
                </div>
              </div>

              {/* 変更後のファイル */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">変更後のファイル</h3>
                <div 
                  ref={refs.modified}
                  onScroll={() => handleScroll(refs.modified)}
                  className="overflow-auto max-h-[600px] bg-gray-50 rounded p-2"
                >
                  {renderFileContent(file2)}
                </div>
              </div>

              {/* 差分 */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">差分</h3>
                <div 
                  ref={refs.diff}
                  onScroll={() => handleScroll(refs.diff)}
                  className="overflow-auto max-h-[600px] bg-gray-50 rounded p-2"
                >
                  {diffResult.map((part, index) => (
                    <pre
                      key={index}
                      className={`${
                        part.added
                          ? 'bg-green-100 text-green-900'
                          : part.removed
                          ? 'bg-red-100 text-red-900'
                          : 'bg-white text-gray-800'
                      } p-2 my-1 rounded font-mono text-sm leading-relaxed`}
                    >
                      {part.value}
                    </pre>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
