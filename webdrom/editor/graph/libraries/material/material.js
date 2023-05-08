

const MATERIAL_CATEGORY = (function () {
    function as_float (value) {
        let s = "" + value;
        if (s.includes(".")) return s;
        return s + ".0";
    }
    const FLOAT_COLOR   = "#45B69C";
    const MATRIX_COLOR  = "#5B8B9E";
    const TEXTURE_COLOR = "#AF5D63";

    let vec1 = new MGraph_Type("float", FLOAT_COLOR);
    let vec2 = new MGraph_Type("vec2", FLOAT_COLOR);
    let vec3 = new MGraph_Type("vec3", FLOAT_COLOR);
    let vec4 = new MGraph_Type("vec4", FLOAT_COLOR);

    let mat2 = new MGraph_Type("mat2", MATRIX_COLOR);
    let mat3 = new MGraph_Type("mat3", MATRIX_COLOR);
    let mat4 = new MGraph_Type("mat4", MATRIX_COLOR);

    let sampler2D = new MGraph_Type("sampler2D", TEXTURE_COLOR);

    let vector_space_VEC_SCALAR = new MGraph_VariantVectorSpace(
        [ "Vector", "Scalar" ],
        [
            new MGraph_VectorSpace([ vec1, vec1 ]),
            new MGraph_VectorSpace([ vec2, vec1 ]),
            new MGraph_VectorSpace([ vec3, vec1 ]),
            new MGraph_VectorSpace([ vec4, vec1 ]),
        ]
    );
    let vector_space_VEC_VEC = new MGraph_VariantVectorSpace(
        [ "Vector A", "Vector B" ],
        [
            new MGraph_VectorSpace([ vec1, vec1 ]),
            new MGraph_VectorSpace([ vec2, vec2 ]),
            new MGraph_VectorSpace([ vec3, vec3 ]),
            new MGraph_VectorSpace([ vec4, vec4 ]),
        ]
    )
    let vector_space_VEC = new MGraph_VariantVectorSpace(
        [ "Result" ],
        [
            new MGraph_VectorSpace([ vec1 ]),
            new MGraph_VectorSpace([ vec2 ]),
            new MGraph_VectorSpace([ vec3 ]),
            new MGraph_VectorSpace([ vec4 ])
        ]
    );
    let vector_space_EMPTY = new MGraph_VariantVectorSpace(
        [],
        [ new MGraph_VectorSpace([]) ]
    );

    let scale_vector = new MGraph_Function(
        "Scale",
        vector_space_VEC_SCALAR,
        vector_space_VEC
    ).modify("compile", [(type, _var, node, inp) => `${type} ${_var} = ${inp[0]} * ${inp[1]};`]);
    let add_vector = new MGraph_Function(
        "Add",
        vector_space_VEC_VEC,
        vector_space_VEC
    ).modify("compile", [(type, _var, node, inp) => `${type} ${_var} = ${inp[0]} + ${inp[1]};`]);
    let subtract_vector = new MGraph_Function(
        "Subtract",
        vector_space_VEC_VEC,
        vector_space_VEC
    ).modify("compile", [(type, _var, node, inp) => `${type} ${_var} = ${inp[0]} - ${inp[1]};`]);
    let matrix_vector_multiplication = new MGraph_Function(
        "Matrix-Vector Multiplication",
        new MGraph_VariantVectorSpace(
            [ "Matrix", "Vector" ],
            [
                new MGraph_VectorSpace( [ mat2, vec2 ] ),
                new MGraph_VectorSpace( [ mat3, vec3 ] ),
                new MGraph_VectorSpace( [ mat4, vec4 ] )
            ]
        ),
        new MGraph_VariantVectorSpace(
            [ "Result" ],
            [
                new MGraph_VectorSpace( [ vec2 ] ),
                new MGraph_VectorSpace( [ vec3 ] ),
                new MGraph_VectorSpace( [ vec4 ] )
            ]
        )
    ).modify("compile", [(type, _var, node, inp) => `${type} ${_var} = ${inp[0]} * ${inp[1]};`]);

    let const_vec1 = new MGraph_Function("Scalar",    vector_space_EMPTY, vec1.as_variant_vector_space("Scalar"))
        .add_parameter(new VecNParameter("Value", [ "const_x" ], 1))
        .modify("compile", [(type, _var, node, inp) => `${type} ${_var} = ${as_float( node.const_x )};`]);
    let const_vec2 = new MGraph_Function("2D Vector", vector_space_EMPTY, vec2.as_variant_vector_space("Vector"))
        .add_parameter(new VecNParameter("Value", [ "const_x", "const_y" ], 2))
        .modify("compile", [(type, _var, node, inp) => `${type} ${_var} = vec2(${node.const_x}, ${node.const_y});`]);
    let const_vec3 = new MGraph_Function("3D Vector", vector_space_EMPTY, vec3.as_variant_vector_space("Vector"))
        .add_parameter(new VecNParameter("Value", [ "const_x", "const_y", "const_z" ], 3))
        .modify("compile", [(type, _var, node, inp) => `${type} ${_var} = vec3(${node.const_x}, ${node.const_y}, ${node.const_z});`]);
    let const_vec4 = new MGraph_Function("4D Vector", vector_space_EMPTY, vec4.as_variant_vector_space("Vector"))
        .add_parameter(new VecNParameter("Value", [ "const_x", "const_y", "const_z", "const_w" ], 4))
        .modify("compile", [(type, _var, node, inp) => `${type} ${_var} = vec4(${node.const_x}, ${node.const_y}, ${node.const_z}, ${node.const_w});`]);

    let uniform_vec1 = new MGraph_Function("Uniform Scalar", vector_space_EMPTY, vec1.as_variant_vector_space("Scalar"))
        .modify("uniform", true)
        .add_parameter( new NameParameter("Name", "uniform_name") );
    let uniform_vec2 = new MGraph_Function("Uniform 2D Vector", vector_space_EMPTY, vec2.as_variant_vector_space("Vector"))
        .modify("uniform", true)
        .add_parameter( new NameParameter("Name", "uniform_name") );
    let uniform_vec3 = new MGraph_Function("Uniform 3D Vector", vector_space_EMPTY, vec3.as_variant_vector_space("Vector"))
        .modify("uniform", true)
        .add_parameter( new NameParameter("Name", "uniform_name") );
    let uniform_vec4 = new MGraph_Function("Uniform 4D Vector", vector_space_EMPTY, vec4.as_variant_vector_space("Vector"))
        .modify("uniform", true)
        .add_parameter( new NameParameter("Name", "uniform_name") );
    let uniform_mat2 = new MGraph_Function("Uniform 2D Matrix", vector_space_EMPTY, mat2.as_variant_vector_space("Matrix"))
        .modify("uniform", true)
        .add_parameter( new NameParameter("Name", "uniform_name") );
    let uniform_mat3 = new MGraph_Function("Uniform 3D Matrix", vector_space_EMPTY, mat3.as_variant_vector_space("Matrix"))
        .modify("uniform", true)
        .add_parameter( new NameParameter("Name", "uniform_name") );
    let uniform_mat4 = new MGraph_Function("Uniform 4D Matrix", vector_space_EMPTY, mat4.as_variant_vector_space("Matrix"))
        .modify("uniform", true)
        .add_parameter( new NameParameter("Name", "uniform_name") );

    let vertex_input = new MGraph_Function( 
        "Vertex Input", vector_space_EMPTY, 
        new MGraph_VariantVectorSpace(
            [ "Position", "Texture Coordinates" ], 
            [ new MGraph_VectorSpace([ vec3, vec2 ]) 
        ])
    ).modify( "in_loc", [ "vertexPosition", "textureCoordinates" ] );
    let vertex_output = new MGraph_Function(
        "Vertex Output", 
        new MGraph_VariantVectorSpace(
            [ "Position", "Texture Coordinates" ],
            [ new MGraph_VectorSpace([ vec4, vec2 ]) ]
        ),
        vector_space_EMPTY
    ).modify("compile", [(type, _var, node, inp) => `gl_Position = ${inp[0]}; out_textCoord = ${inp[1]};`]);

    let fragment_input = new MGraph_Function(
        "Fragment Input",
        vector_space_EMPTY,
        new MGraph_VariantVectorSpace(
            [ "Texture Coordinates", "Fragment Coordinates" ],
            [ new MGraph_VectorSpace([ vec2, vec4 ]) ]
        )
    ).modify( "in_loc", [ "out_textCoord", "gl_FragCoord" ] );
    let fragment_output = new MGraph_Function(
        "Fragment Output",
        new MGraph_VariantVectorSpace(
            [ "Output Color" ],
            [ new MGraph_VectorSpace( [ vec4 ] ) ]
        ),
        vector_space_EMPTY
    ).modify("compile", [(type, _var, node, inp) => `gl_FragColor = ${inp[0]}; if (gl_FragColor.w <= 0.1) discard;`]);

    let decompose2 = new MGraph_Function(
        "Decompose 2D Vector",
        vec2.as_variant_vector_space("Vector"),
        new MGraph_VariantVectorSpace( [ "x", "y" ], [
            new MGraph_VectorSpace([ vec1, vec1 ])
        ])
    ).modify("shortcuts", [ (i) => i[0] + ".x", (i) => i[0] + ".y" ]);
    let decompose3 = new MGraph_Function(
        "Decompose 3D Vector",
        vec3.as_variant_vector_space("Vector"),
        new MGraph_VariantVectorSpace( [ "x", "y", "z" ], [
            new MGraph_VectorSpace([ vec1, vec1, vec1 ])
        ])
    ).modify("shortcuts", [ (i) => i[0] + ".x", (i) => i[0] + ".y", (i) => i[0] + ".z" ]);
    let decompose4 = new MGraph_Function(
        "Decompose 4D Vector",
        vec4.as_variant_vector_space("Vector"),
        new MGraph_VariantVectorSpace( [ "x", "y", "z", "w" ], [
            new MGraph_VectorSpace([ vec1, vec1, vec1, vec1 ])
        ])
    ).modify("shortcuts", [ (i) => i[0] + ".x", (i) => i[0] + ".y", (i) => i[0] + ".z", (i) => i[0] + ".w" ]);
    let compose2 = new MGraph_Function(
        "Compose 2D Vector",
        new MGraph_VariantVectorSpace( [ "x", "y" ], [
            new MGraph_VectorSpace([ vec1, vec1 ])
        ]),
        vec2.as_variant_vector_space("Vector")
    ).modify("compile", [ (type, _var, node, inp) => `${type} ${_var} = vec2(${inp[0]}, ${inp[1]});` ]);
    let compose3 = new MGraph_Function(
        "Compose 3D Vector",
        new MGraph_VariantVectorSpace( [ "x", "y", "z" ], [
            new MGraph_VectorSpace([ vec1, vec1, vec1 ])
        ]),
        vec3.as_variant_vector_space("Vector")
    ).modify("compile", [ (type, _var, node, inp) => `${type} ${_var} = vec3(${inp[0]}, ${inp[1]}, ${inp[2]});` ]);
    let compose4 = new MGraph_Function(
        "Compose 4D Vector",
        new MGraph_VariantVectorSpace( [ "x", "y", "z", "w" ], [
            new MGraph_VectorSpace([ vec1, vec1, vec1, vec1 ])
        ]),
        vec4.as_variant_vector_space("Vector")
    ).modify("compile", [ (type, _var, node, inp) => `${type} ${_var} = vec4(${inp[0]}, ${inp[1]}, ${inp[2]}, ${inp[3]});` ]);

    let category_constants = new MGraph_Category(
        "Constant", [], [ const_vec1, const_vec2, const_vec3, const_vec4 ]
    );
    let category_operands = new MGraph_Category(
        "Operands", [], [ 
            scale_vector, add_vector, subtract_vector,
            matrix_vector_multiplication
        ]
    );
    let category_communication = new MGraph_Category(
        "Communication",
        [
            new MGraph_Category( "Input",   [], [ vertex_input, fragment_input ] ),
            new MGraph_Category( "Output",  [], [ vertex_output, fragment_output ] ),
            new MGraph_Category( "Uniform", [], [
                uniform_vec1,
                uniform_vec2,
                uniform_vec3,
                uniform_vec4,
                uniform_mat2,
                uniform_mat3,
                uniform_mat4
            ] ),
        ], []
    );
    let category_vector = new MGraph_Category( "Vector", [],
        [
            decompose2, decompose3, decompose4,
            compose2, compose3, compose4
        ]
    );

    let root_category = new MGraph_Category(
        "ROOT", [ category_constants, category_operands, category_communication, category_vector ], []
    );

    return {
        types: {
            vec1: vec1,
            vec2: vec2,
            vec3: vec3,
            vec4: vec4,
            mat2: mat2,
            mat3: mat3,
            mat4: mat4,
            sampler2D, sampler2D
        },
        functions: {
            add_vector,
            scale_vector,
            matrix_vector_multiplication,
            subtract_vector,

            const_vec1,
            const_vec2,
            const_vec3,
            const_vec4,

            uniform_vec1,
            uniform_vec2,
            uniform_vec3,
            uniform_vec4,
            uniform_mat2,
            uniform_mat3,
            uniform_mat4,

            vertex_input,
            vertex_output,
            fragment_input,
            fragment_output
        },
        library: new MGraph_Library(root_category)
    }
})();

