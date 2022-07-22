import dropbox
from pathlib import Path
import sys
import os
from dotenv import load_dotenv
load_dotenv()


class DropBox:
    _REFRESH_TOKEN = os.getenv("REFRESH_TOKEN")
    _APP_KEY = os.getenv("APP_KEY")
    _APP_SECRET = os.getenv("APP_SECRET")

    def __init__(self, timeout=900, chunk=8):
        self.timeout = timeout
        self.chunk = chunk

    def UpLoadFile(self, source, destination):
        dbx = dropbox.Dropbox(app_key=self._APP_KEY, app_secret=self._APP_SECRET,
                              oauth2_refresh_token=self._REFRESH_TOKEN, timeout=self.timeout)
        file_size = Path(source).stat().st_size
        CHUNK_SIZE = self.chunk * 1024 * 1024
        with open(source, 'rb') as f:
            if file_size <= CHUNK_SIZE:
                dbx.files_upload(f.read(), destination)
            else:
                upload_session_start_result = dbx.files_upload_session_start(
                    f.read(CHUNK_SIZE))
                cursor = dropbox.files.UploadSessionCursor(session_id=upload_session_start_result.session_id,
                                                           offset=f.tell())
                commit = dropbox.files.CommitInfo(path=destination)
                while f.tell() <= file_size:
                    if ((file_size - f.tell()) <= CHUNK_SIZE):
                        dbx.files_upload_session_finish(
                            f.read(CHUNK_SIZE), cursor, commit)
                        break
                    else:
                        dbx.files_upload_session_append_v2(
                            f.read(CHUNK_SIZE), cursor)
                        cursor.offset = f.tell()


def upload_dropbox(source_dir):
    DPB = DropBox()
    path = Path(source_dir)
    for file in path.glob('**/*'):
        if not file.is_dir():
            destination = f"/New Movies/{path.name}/{file.relative_to(path)}"
            DPB.UpLoadFile(file, destination)
            file.unlink()
    path.rmdir()


if __name__ == '__main__':
    source_dir = sys.argv[1]
    upload_dropbox(source_dir)
