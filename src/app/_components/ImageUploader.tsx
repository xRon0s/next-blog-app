"use client";
import { useState, ChangeEvent } from "react";
import { supabase } from "@/utils/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCloudArrowUp, faImage } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";

const calculateMD5Hash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  return CryptoJS.MD5(wordArray).toString();
};

type Props = {
  imageURL: string;
  onImageChange: (url: string) => void;
};

const ImageUploader: React.FC<Props> = ({ imageURL, onImageChange }) => {
  const bucketName = "cover-image";
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const fileHash = await calculateMD5Hash(file);
      const path = `collections/${fileHash}`;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(path, file, { upsert: true });

      if (error || !data) {
        throw new Error(error?.message || "アップロードに失敗しました");
      }

      const publicUrlResult = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      onImageChange(publicUrlResult.data.publicUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "アップロードに失敗しました";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-bold">画像</label>

      {/* プレビュー */}
      {imageURL ? (
        <div className="relative w-full overflow-hidden rounded-lg border border-slate-200">
          <img
            src={imageURL}
            alt="プレビュー"
            className="max-h-48 w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400">
          <FontAwesomeIcon icon={faImage} className="mr-2 text-2xl" />
          画像を選択してください
        </div>
      )}

      {/* アップロードボタン */}
      <div className="flex items-center gap-2">
        <label
          className={twMerge(
            "cursor-pointer rounded-md px-4 py-2 text-sm font-semibold",
            "bg-slate-100 text-slate-700 hover:bg-slate-200",
            "border border-slate-300",
            isUploading && "cursor-not-allowed opacity-50"
          )}
        >
          {isUploading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCloudArrowUp} className="mr-1" />
              ファイルを選択
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>

        <span className="text-xs text-slate-400">または</span>

        <input
          type="url"
          value={imageURL}
          onChange={(e) => onImageChange(e.target.value)}
          placeholder="URLを直接入力"
          className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {uploadError && (
        <div className="text-sm text-red-500">{uploadError}</div>
      )}
    </div>
  );
};

export default ImageUploader;
