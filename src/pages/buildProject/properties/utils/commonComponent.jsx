export const Loader = () =>{
    return <>
        <div style={{
            position:        'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            zIndex:          9999,
        }}>
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Saving…</span>
            </div>
        </div>
    </>
}