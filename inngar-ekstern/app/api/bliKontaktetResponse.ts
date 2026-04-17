export interface BliKontaktetResponse {
    frist: string
}

export interface BliKontaktetErrorResponse {
    ok: false
    error: string
}

export interface BliKontaktetSuccess {
    ok: true
    body: BliKontaktetResponse
}