import { ChangeEvent, ReactNode, RefObject, useCallback, useRef, useState } from 'react'
import Papa, { ParseResult } from 'papaparse';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Uploader } from './uploader/Uploader';
import styles from './App.module.css'
import { formatFileSize } from 'react-papaparse';

const archidektFileHeaders = 'Quantity,Card Name,Set Name,Set Code,Printing,Card Num\n';

type ArchidektList = {
  'Quantity': string;
  'Card Name': string;
  'Set Name': string;
  'Set Code': string;
  'Printing': string;
  'Card Num': string;
};

type DragonShieldCard = {
  'Folder Name': string;
  'Quantity': string;
  'Trade Quantity': string;
  'Card Name': string;
  'Set Code': string;
  'Set Name': string;
  'Card Number': string;
  'Condition': string;
  'Printing': string;
  'Language': string;
  'Price Bought': string;
  'Date Bought': string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const [archidektParsed, setArchidektParsed] = useState<ArchidektList[] | null>(null);
  const [folderName, setFolderName] = useState<string>('');
  const [dragonShieldJSON, setDragonShieldJSON] = useState<DragonShieldCard[] | null>(null);

  const inputRef: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);

  const handleSelectedFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file);
  };

  const handleParse = useCallback(() => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const fileContent = e?.target?.result;
      const csvWithHeaders = archidektFileHeaders + fileContent;

      Papa.parse(csvWithHeaders, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<ArchidektList>) => {
          console.log(results)
          setArchidektParsed(results.data);
        },
      });
      console.log('finished parsing');

    };
    if (selectedFile) {
      reader.readAsText(selectedFile);
    }
  }, [selectedFile]);

  const handleFolderNameBlur = (event: ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  };

  const handleConvertToDS = async () => {
    const newDragonShieldList = archidektParsed?.map((card: ArchidektList) => {
      return {
        'Folder Name': folderName!,
        'Quantity': card.Quantity,
        'Trade Quantity': '0',
        'Card Name': card['Card Name'],
        'Set Code': card['Set Code'],
        'Set Name': card['Set Name'],
        'Card Number': card['Card Num'],
        'Condition': 'NearMint',
        'Printing': card.Printing === 'Etched' ? 'Foil' : card.Printing,
        'Language': 'English',
        'Price Bought': '0',
        'Date Bought': '6/25/2022'
      };
    });
    setDragonShieldJSON(newDragonShieldList!);
  };

  const handleDownloadFile = useCallback(() => {
    const csv = Papa.unparse(dragonShieldJSON!);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${folderName}.csv`;
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }, [dragonShieldJSON]);

  const handleBrowseClick = () => {
    inputRef?.current?.click();
  }

  return (
    <>
      <div id='uploader'>
        <Uploader />
      </div>
      <div id='homemade_uploader' className={styles.csvReader}>
        <button type='button' onClick={handleBrowseClick} className={styles.browseFile}>Browse File</button>
        <div className={styles.acceptedFile}>
          {selectedFile && (<p>{selectedFile.name + ' | ' + formatFileSize(selectedFile.size)}</p>)}
        </div>
        <button className={styles.browseFile} onClick={handleParse}>Parse File</button>
        <input ref={inputRef} id='csvFile' type='file' style={{ display: 'none' }} onChange={handleSelectedFile}/>
      </div>
      {archidektParsed && (
        <div>
          <label>File parsed!</label>
        </div>
      )}
      {archidektParsed && (
        <div>
          <label htmlFor='folderName'>Folder Name</label>
          <input type='text' id='folderName' placeholder='Folder Name' value={folderName} onChange={handleFolderNameBlur} />
        </div>
      )}
      <div className={styles.convertButtons}>
        <button onClick={handleConvertToDS} disabled={!folderName}>Convert to Dragon Shield Inventory</button>
        <button onClick={handleDownloadFile} disabled={!dragonShieldJSON && !folderName}>Download Dragonshield Inventory Import CSV</button>
      </div>
      <div>
      {dragonShieldJSON && (
        <code>
          {JSON.stringify(dragonShieldJSON)}
        </code>
      )}
      </div>
      <div>
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
    </>
  )
}

export default App
