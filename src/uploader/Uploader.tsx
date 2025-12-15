import { formatFileSize, useCSVReader } from 'react-papaparse';
import styles from './Uploader.module.css';
import { useState } from 'react';

export const Uploader = () => {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState<boolean>(false);

  return (
    <CSVReader
      onUploadAccepted={(results) => console.log(`did the ${results} thing!`)}
      onDragOver={() => console.log('did the drag thing!')}
      onDragLeave={() => console.log('did the drag leave thing!')}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
        Remove
      }) => {
        <>
          <div
            {...getRootProps()}
            className={styles.zone}
            id='papareact'
          >
            {acceptedFile && (
              <>
                <div className={styles.file}>
                  <div className={styles.info}>
                    <span className={styles.size}>
                      {formatFileSize(acceptedFile.size)}
                    </span>
                    <span className={styles.name}>{acceptedFile.name}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <ProgressBar />
                  </div>
                </div>
              </>
            )}
            {!acceptedFile && (
              'drop CSV file here or click to upload'
            )}
          </div>
        </>
      }}
    </CSVReader>
  );
};
