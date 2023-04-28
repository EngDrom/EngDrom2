

const MATERIAL_CATEGORY = (function () {
    const FLOAT_COLOR   = "#45B69C";
    const MATRIX_COLOR  = "#5B8B9E";
    const TEXTURE_COLOR = "#AF5D63";

    let vec1 = new MGraph_Type("Scalar", FLOAT_COLOR);
    let vec2 = new MGraph_Type("2D Vector", FLOAT_COLOR);
    let vec3 = new MGraph_Type("3D Vector", FLOAT_COLOR);
    let vec4 = new MGraph_Type("4D Vector", FLOAT_COLOR);

    let mat2 = new MGraph_Type("2D Matrix", MATRIX_COLOR);
    let mat3 = new MGraph_Type("3D Matrix", MATRIX_COLOR);
    let mat4 = new MGraph_Type("4D Matrix", MATRIX_COLOR);

    let sampler2D = new MGraph_Type("2D Texture", TEXTURE_COLOR);

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
    );
    let add_vector = new MGraph_Function(
        "Add",
        vector_space_VEC_VEC,
        vector_space_VEC
    );
    let subtract_vector = new MGraph_Function(
        "Subtract",
        vector_space_VEC_VEC,
        vector_space_VEC
    );
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
    )

    let const_vec1 = new MGraph_Function("Scalar",    vector_space_EMPTY, vec1.as_variant_vector_space("Scalar"))
        .add_parameter(new VecNParameter("Value", [ "const_x" ], 1));
    let const_vec2 = new MGraph_Function("2D Vector", vector_space_EMPTY, vec2.as_variant_vector_space("Vector"))
        .add_parameter(new VecNParameter("Value", [ "const_x", "const_y" ], 2));
    let const_vec3 = new MGraph_Function("3D Vector", vector_space_EMPTY, vec3.as_variant_vector_space("Vector"))
        .add_parameter(new VecNParameter("Value", [ "const_x", "const_y", "const_z" ], 3));
    let const_vec4 = new MGraph_Function("4D Vector", vector_space_EMPTY, vec4.as_variant_vector_space("Vector"))
        .add_parameter(new VecNParameter("Value", [ "const_x", "const_y", "const_z", "const_w" ], 4));

    let uniform_vec1 = new MGraph_Function("Uniform Scalar", vector_space_EMPTY, vec1.as_variant_vector_space("Scalar"));
    let uniform_vec2 = new MGraph_Function("Uniform 2D Vector", vector_space_EMPTY, vec2.as_variant_vector_space("Vector"));
    let uniform_vec3 = new MGraph_Function("Uniform 3D Vector", vector_space_EMPTY, vec3.as_variant_vector_space("Vector"));
    let uniform_vec4 = new MGraph_Function("Uniform 4D Vector", vector_space_EMPTY, vec4.as_variant_vector_space("Vector"));
    let uniform_mat2 = new MGraph_Function("Uniform 2D Matrix", vector_space_EMPTY, mat2.as_variant_vector_space("Matrix"));
    let uniform_mat3 = new MGraph_Function("Uniform 3D Matrix", vector_space_EMPTY, mat3.as_variant_vector_space("Matrix"));
    let uniform_mat4 = new MGraph_Function("Uniform 4D Matrix", vector_space_EMPTY, mat4.as_variant_vector_space("Matrix"));

    let vertex_input = new MGraph_Function( 
        "Vertex Input", vector_space_EMPTY, 
        new MGraph_VariantVectorSpace(
            [ "Position", "Texture Coordinates" ], 
            [ new MGraph_VectorSpace([ vec3, vec2 ]) 
        ])
    );
    let vertex_output = new MGraph_Function(
        "Vertex Output", 
        new MGraph_VariantVectorSpace(
            [ "Position", "Texture Coordinates" ],
            [ new MGraph_VectorSpace([ vec3, vec2 ]) ]
        ),
        vector_space_EMPTY
    );

    let decompose2 = new MGraph_Function(
        "Decompose 2D Vector",
        vec2.as_variant_vector_space("Vector"),
        new MGraph_VariantVectorSpace( [ "x", "y" ], [
            new MGraph_VectorSpace([ vec1, vec1 ])
        ])
    );
    let decompose3 = new MGraph_Function(
        "Decompose 3D Vector",
        vec3.as_variant_vector_space("Vector"),
        new MGraph_VariantVectorSpace( [ "x", "y", "z" ], [
            new MGraph_VectorSpace([ vec1, vec1, vec1 ])
        ])
    );
    let decompose4 = new MGraph_Function(
        "Decompose 4D Vector",
        vec4.as_variant_vector_space("Vector"),
        new MGraph_VariantVectorSpace( [ "x", "y", "z", "w" ], [
            new MGraph_VectorSpace([ vec1, vec1, vec1, vec1 ])
        ])
    );
    let compose2 = new MGraph_Function(
        "Compose 2D Vector",
        new MGraph_VariantVectorSpace( [ "x", "y" ], [
            new MGraph_VectorSpace([ vec1, vec1 ])
        ]),
        vec2.as_variant_vector_space("Vector")
    );
    let compose3 = new MGraph_Function(
        "Compose 3D Vector",
        new MGraph_VariantVectorSpace( [ "x", "y", "z" ], [
            new MGraph_VectorSpace([ vec1, vec1, vec1 ])
        ]),
        vec3.as_variant_vector_space("Vector")
    );
    let compose4 = new MGraph_Function(
        "Compose 4D Vector",
        new MGraph_VariantVectorSpace( [ "x", "y", "z", "w" ], [
            new MGraph_VectorSpace([ vec1, vec1, vec1, vec1 ])
        ]),
        vec4.as_variant_vector_space("Vector")
    );

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
            new MGraph_Category( "Input",   [], [ vertex_input ] ),
            new MGraph_Category( "Output",  [], [ vertex_output ] ),
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
        library: new MGraph_Library(root_category)
    }
})();

