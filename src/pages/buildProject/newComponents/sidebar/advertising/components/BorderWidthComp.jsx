export const BorderWidthComp = ({ label, value, onChange, name }) => {
        return (
            <div className="color-input-wrpr">
                <p className="label color-labels">{label}</p>

                <div> 
                    <input
                        value={value}
                        onChange={(e) => { 
                            onChange(e.target.value);
                        }}
                        className="form-control"
                        type="number"
                        name={name}
                        style={{ width: 100 }} 
                        placeholder='Sec'
                    />
                </div>
            </div>
        );
    };