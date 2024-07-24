
export type File ={
    name: string,
    path: string,
    is_dir: boolean,
    size: number
}

export type DiskInfo = {
    name: string,
    path: string,
    free_space: number,
    total_space: number
}