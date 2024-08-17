// AuthContext.tsx
import React, { createContext, ReactNode, useState } from "react";
import { ACTIONS } from "./useData";

// Create the Auth context
export const DataContext = createContext<
  | {
      handleSelectNewFile: (file: File) => void;

      activeAction: ACTIONS;
      setActiveAction: (action: ACTIONS) => void;
      srcFile: File | undefined;
      srcImgInfo: {
        size: number;
        name: string;
        type: string;
        w: number;
        h: number;
      };
      clearSrc: () => void;
      activeActionData: string;
      setActiveActionData: (val: string) => void;
      submitChange: (imageDataUrl: string, op: string) => void;
      imgHistory: {
        img: HTMLImageElement;
        imageDataUrl: string;
        op: string;
      }[];

      currentImage: { img: HTMLImageElement; imageDataUrl: string } | undefined;
    }
  | undefined
>(undefined);

// AuthProvider component to provide Auth context
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeAction, setActiveAction] = useState(ACTIONS.none);
  const [activeActionData, setActiveActionData] = useState<string>("");

  // SRC DATA
  const [srcFile, setSrcFile] = useState<File | undefined>();
  const [srcImgInfo, setSrcImgInfo] = useState({
    size: 0,
    name: "",
    type: "",
    w: 0,
    h: 0,
  });

  // edited DATA history
  const [imgHistory, setImgHistory] = useState<
    {
      img: HTMLImageElement;
      imageDataUrl: string;
      op: string;
    }[]
  >([]);
  const [activeImage, setActiveImage] = useState(0);

  function submitChange(imageDataUrl: string, op: string) {
    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      setImgHistory((p) => [
        ...p,
        {
          img,
          imageDataUrl,
          op,
        },
      ]);
      setActiveImage(imgHistory.length);
    };
  }

  // get image on file selected
  const handleSelectNewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result as string;

      const img = new Image();
      img.src = imageDataUrl;
      img.onload = () => {
        const { size, name, type } = file;
        setSrcImgInfo({
          size,
          name,
          type,
          w: img.naturalWidth,
          h: img.naturalHeight,
        });

        setImgHistory([{ img, imageDataUrl, op: "original" }]);
        setActiveImage(0);
        setSrcFile(file);
      };
    };
    reader.readAsDataURL(file);
  };

  const clearSrc = () => {
    setSrcFile(undefined);
    setSrcImgInfo({
      size: 0,
      name: "",
      type: "",
      w: 0,
      h: 0,
    });
    setActiveAction(ACTIONS.none);
    setActiveActionData("");
    setImgHistory([]);
    setActiveImage(0);
  };

  return (
    <DataContext.Provider
      value={{
        handleSelectNewFile,
        activeAction,
        setActiveAction,
        srcFile,
        srcImgInfo,
        clearSrc,
        activeActionData,
        setActiveActionData,
        submitChange,
        imgHistory,
        currentImage: imgHistory[activeImage],
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
