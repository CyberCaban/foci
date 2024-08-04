
export type FileInfo ={
    name: string,
    path: string,
    is_dir: boolean,
    size: number
}

export type VolumesInfo = {
    name: string,
    path: string,
    free_space: number,
    total_space: number
}